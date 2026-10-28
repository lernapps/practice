#!/usr/bin/env node
// The intake of a submission (action `validate`, job `intake`): reads the issue and the comments of its author, finds
// the ZIP address (the latest upload: in the field of the form or in a comment of the author), downloads the ZIP file, checks it and unpacks it into a throwaway folder. It runs nothing from the ZIP file and writes nothing to
// GitHub: the token has issues: read only. What went wrong goes into result.json; the job `publish` turns it into the
// comment.
//
//   node actions/validate/validate.ts            environment: GITHUB_TOKEN, GITHUB_REPOSITORY, ISSUE_NUMBER, FORCE,
//                                                 ZIP_URL (a maintainer's test run: the ZIP file from there instead
//                                                 of the issue), OUT_DIR (default _intake), GITHUB_OUTPUT
//
// Output folder: result.json (always), and for a valid submission meta.json and tree/src/… (the unpacked files).
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { apiFromEnv, COMMENT_MARKER, fingerprintIn, paginate, type Api } from "../lib/github.ts";
import { chooseZipUrl, isSubmission, readDeclarations, readMeta, sections } from "../lib/form.ts";
import { DOWNLOAD_TIMEOUT_SECONDS, MAINTAINER_ZIP_PREFIXES, MAX_DOWNLOAD_BYTES } from "../lib/limits.ts";
import { extractZip, inspectZip, type Problem } from "../lib/zip.ts";

export interface Result {
  version: 1;
  issue: number;
  /** The issue came from the form (all headings there) and is open: only then anything else happens. */
  relevant: boolean;
  ok: boolean;
  /** Same ZIP address and fields as the last run that got a comment: nothing to do (not on workflow_dispatch). */
  unchanged?: boolean;
  /** Hash of the ZIP address and the fields; publish writes it into the comment, the next run compares. */
  fingerprint?: string;
  problems: Problem[];
  meta?: { issue: number; subject: string; grade: string; federalState: string; created: string };
  zip?: { url: string; bytes: number; files: number; unpackedBytes: number };
}

/** Gets the ZIP file from `url` into a buffer. A failure is a Problem for the person, not an exception. */
export type Download = (url: string) => { buffer?: Buffer; problem?: Problem };

const ATTACHMENTS = /^https:\/\/github\.com\/user-attachments\/files\/\d{1,20}\/[A-Za-z0-9._%+~-]{1,200}\.zip$/;
const FINAL_HOST = /^https:\/\/([a-z0-9-]+\.)*(githubusercontent\.com|github\.com)\//;

/**
 * Whether a maintainer's test run may load a ZIP file from `url`: an attachment address, or a .zip below one of
 * MAINTAINER_ZIP_PREFIXES, in plain characters, without "..", a query or a fragment.
 */
export function maintainerZipUrl(url: string): boolean {
  if (ATTACHMENTS.test(url)) return true;
  if (!/^[A-Za-z0-9:/._%+~-]{1,400}\.zip$/.test(url) || url.split("/").some((part) => part === ".." || part === ".")) return false;
  return MAINTAINER_ZIP_PREFIXES.some((prefix) => url.startsWith(prefix) && url.length > prefix.length);
}

/**
 * curl -L with limits: https only (also after a redirect), at most 5 redirects, 10 MB, a time limit; no shell, the
 * address was checked before (ATTACHMENTS from the form, maintainerZipUrl for a test run). The final address must
 * still be on GitHub.
 */
export const curlDownload: Download = (url) => {
  if (!maintainerZipUrl(url)) return { problem: { code: "zip-url", text: "Die Adresse der ZIP-Datei ist nicht erlaubt." } };
  const folder = join(process.env["RUNNER_TEMP"] || "/tmp", `zip-${process.pid}`);
  mkdirSync(folder, { recursive: true });
  const file = join(folder, "download.zip");
  try {
    const run = spawnSync(
      "curl",
      [
        "--silent",
        "--show-error",
        "--location",
        "--fail",
        "--proto",
        "=https",
        "--proto-redir",
        "=https",
        "--max-redirs",
        "5",
        "--max-filesize",
        String(MAX_DOWNLOAD_BYTES),
        "--max-time",
        String(DOWNLOAD_TIMEOUT_SECONDS),
        "--output",
        file,
        "--write-out",
        "%{url_effective}",
        "--",
        url,
      ],
      { encoding: "utf8" },
    );
    if (run.status === 63) {
      return { problem: { code: "download-large", text: `Die ZIP-Datei ist größer als ${MAX_DOWNLOAD_BYTES / 1024 / 1024} MB.` } };
    }
    if (run.status !== 0) {
      return {
        problem: {
          code: "download",
          text: "Wir konnten die ZIP-Datei nicht laden. Hänge sie bitte noch einmal als Kommentar an dieses Issue an.",
        },
      };
    }
    if (!FINAL_HOST.test(run.stdout.trim())) {
      return { problem: { code: "download-host", text: "Die ZIP-Datei kommt nicht von GitHub. Wir laden sie nicht." } };
    }
    if (statSync(file).size > MAX_DOWNLOAD_BYTES) {
      return { problem: { code: "download-large", text: `Die ZIP-Datei ist größer als ${MAX_DOWNLOAD_BYTES / 1024 / 1024} MB.` } };
    }
    return { buffer: readFileSync(file) };
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
};

interface Options {
  issue: number;
  outDir: string;
  /** The issue as the API gives it. */
  state: string;
  body: string;
  /** The texts of the comments of the issue's author, oldest first: a ZIP file there replaces an older one. */
  ownerComments?: readonly string[];
  download: Download;
  now?: Date;
  /** The fingerprint in the comment of the last run. */
  previous?: string | undefined;
  /** Run again even when nothing changed (workflow_dispatch). */
  force?: boolean;
  /** A maintainer's test run (workflow_dispatch, zip_url): the ZIP file from here instead of the issue's field. */
  zipUrl?: string;
}

/** The whole intake for an issue whose text is known. Writes `outDir`. */
export function intake(options: Options): Result {
  const { issue, outDir, body } = options;
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const write = (result: Result): Result => {
    writeFileSync(join(outDir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
    return result;
  };
  if (options.state !== "open" || !isSubmission(body)) {
    return write({ version: 1, issue, relevant: false, ok: false, problems: [] });
  }
  const found = sections(body);
  const problems: Problem[] = [];
  const { meta, problems: metaProblems } = readMeta(found);
  problems.push(...metaProblems, ...readDeclarations(found));
  const given = options.zipUrl === undefined || options.zipUrl === "" ? undefined : options.zipUrl;
  const { url, problems: zipProblems } = given === undefined ? chooseZipUrl(found, options.ownerComments) : { url: given, problems: [] };
  problems.push(...zipProblems);
  if (given !== undefined && !maintainerZipUrl(given)) {
    problems.push({ code: "zip-url", text: "Die Adresse der ZIP-Datei des Testlaufs ist nicht erlaubt." });
  }
  const fail = (extra: Problem[] = []): Result =>
    write({ version: 1, issue, relevant: true, ok: false, problems: [...problems, ...extra] });

  if (url === undefined || problems.length > 0 || meta === undefined) {
    // Without a valid form there is no point in downloading; but a missing ZIP is not the only thing to tell.
    return fail();
  }
  const fingerprint = createHash("sha256").update([url, meta.subject, meta.grade, meta.federalState].join("\n")).digest("hex");
  if (options.previous === fingerprint && options.force !== true) {
    return write({ version: 1, issue, relevant: true, ok: false, unchanged: true, fingerprint, problems: [] });
  }
  const downloaded = options.download(url);
  if (downloaded.buffer === undefined) return fail(downloaded.problem ? [downloaded.problem] : []);

  const inspection = inspectZip(downloaded.buffer);
  if (inspection.problems.length > 0) return fail(inspection.problems);
  const tree = join(outDir, "tree");
  const unpackProblems = extractZip(downloaded.buffer, inspection.entries, tree);
  if (unpackProblems.length > 0) {
    rmSync(tree, { recursive: true, force: true });
    return fail(unpackProblems);
  }
  const files = inspection.entries.filter((entry) => !entry.isDirectory);
  const created = (options.now ?? new Date()).toISOString();
  const fullMeta = { issue, ...meta, created };
  writeFileSync(join(outDir, "meta.json"), `${JSON.stringify(fullMeta, null, 2)}\n`);
  return write({
    version: 1,
    issue,
    relevant: true,
    ok: true,
    fingerprint,
    problems: [],
    meta: fullMeta,
    zip: {
      url,
      bytes: downloaded.buffer.length,
      files: files.length,
      unpackedBytes: files.reduce((sum, entry) => sum + entry.size, 0),
    },
  });
}

function output(name: string, value: string): void {
  const file = process.env["GITHUB_OUTPUT"];
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

async function readIssue(api: Api, repo: string, issue: number): Promise<{ state: string; body: string; author?: number }> {
  const response = await api.request("GET", `/repos/${repo}/issues/${issue}`);
  const row = response.body as { state?: unknown; body?: unknown; pull_request?: unknown; user?: { id?: unknown } } | undefined;
  if (response.status !== 200 || row === undefined) throw new Error(`cannot read issue #${issue} (${response.status})`);
  // a pull request is not a submission
  if (row.pull_request !== undefined) return { state: "pull_request", body: "" };
  const author = typeof row.user?.id === "number" ? row.user.id : undefined;
  return { state: String(row.state), body: typeof row.body === "string" ? row.body : "", ...(author === undefined ? {} : { author }) };
}

interface CommentRow {
  body?: string;
  user?: { id?: number; type?: string };
}

/** The texts of the comments the issue's author wrote, oldest first; never a bot's, never another person's. */
export function ownerCommentTexts(rows: readonly CommentRow[], author: number | undefined): string[] {
  if (author === undefined) return [];
  return rows.filter((row) => row.user?.id === author && row.user.type !== "Bot").map((row) => row.body ?? "");
}

async function main(): Promise<number> {
  try {
    const raw = process.env["ISSUE_NUMBER"] ?? "";
    if (!/^[1-9]\d{0,8}$/.test(raw)) throw new Error("ISSUE_NUMBER is not an issue number");
    const issue = Number(raw);
    const api = apiFromEnv();
    const { state, body, author } = await readIssue(api, api.repo, issue);
    const comments = await paginate<CommentRow>(api, `/repos/${api.repo}/issues/${issue}/comments`);
    const previous = comments
      .filter((c) => c.user?.type === "Bot" && c.body?.includes(COMMENT_MARKER))
      .map((c) => fingerprintIn(c.body ?? ""))
      .find((f) => f !== undefined);
    const result = intake({
      issue,
      outDir: resolve(process.env["OUT_DIR"] || "_intake"),
      state,
      body,
      ownerComments: ownerCommentTexts(comments, author),
      download: curlDownload,
      previous,
      force: process.env["FORCE"] === "true",
      zipUrl: process.env["ZIP_URL"] ?? "",
    });
    output("relevant", String(result.relevant));
    output("ok", String(result.ok));
    output("unchanged", String(result.unchanged === true));
    for (const p of result.problems) console.log(`problem ${p.code}: ${p.text.replace(/\n/g, " ")}`);
    console.log(
      result.unchanged
        ? `issue #${issue}: same ZIP address and fields as the last run, nothing to do (run workflow_dispatch to repeat)`
        : result.relevant
        ? `issue #${issue}: ${result.ok ? `valid, ${result.zip?.files} files` : `${result.problems.length} problem(s)`}`
        : `issue #${issue}: not a submission, nothing to do`,
    );
    return 0;
  } catch (error) {
    console.error(`::error::intake: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
