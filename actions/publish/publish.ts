#!/usr/bin/env node
// The last step of a submission (action `publish`, job `publish`: contents: write, issues: write). It runs code of
// this repo only and treats the artifacts as data. Three cases, one comment per issue (updated in place):
//   - the submission is not valid           -> the comment lists what to change (problems of result.json)
//   - the build or the check failed         -> the comment shows the end of the log
//   - the site is there                     -> the site is checked again (size, paths, endings, noindex), written to
//                                              the branch gh-pages below i/<issue>/, and the comment links it
//
//   node actions/publish/publish.ts
// Environment: GITHUB_TOKEN, GITHUB_REPOSITORY, ISSUE_NUMBER, BUILD_RESULT (result of the job build), RUN_URL,
// INTAKE_DIR (_intake), BUILD_DIR (_buildinfo, build.json), SITE_DIR (_site), PAGES_DIR (_pages, work folder),
// GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT, LERNAPPS_PUBLISH_TIMEOUT (seconds to wait for Pages, default 300),
// PRACTICE_REMOTE (a git address instead of GitHub; tests only).
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  apiFromEnv,
  buildFailedComment,
  COMMENT_MARKER,
  fingerprintLine,
  pagesAddress,
  previewComment,
  problemsComment,
  upsertComment,
  type Api,
} from "../lib/github.ts";
import { LIFETIME_DAYS, MAX_SITE_BYTES, MAX_SITE_FILES, SITE_EXTENSIONS } from "../lib/limits.ts";
import { changeBranch } from "../lib/pages.ts";
import type { Result } from "../validate/validate.ts";

export interface SiteReport {
  files: number;
  bytes: number;
  problems: string[];
}

/** Checks the built site once more before it goes to a public branch. It reads nothing but names, kinds and sizes. */
export function checkSite(dir: string): SiteReport {
  const report: SiteReport = { files: 0, bytes: 0, problems: [] };
  const bad = (message: string) => {
    if (report.problems.length < 20) report.problems.push(message);
  };
  const walk = (folder: string) => {
    for (const name of readdirSync(folder)) {
      const path = join(folder, name);
      const shown = relative(dir, path);
      const stat = lstatSync(path);
      if (!/^[A-Za-z0-9._@~+-]+$/.test(name) || name.startsWith(".") || name.includes("..")) {
        bad(`name not allowed: ${JSON.stringify(shown)}`);
        continue;
      }
      if (stat.isSymbolicLink()) bad(`link: ${shown}`);
      else if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) {
        report.files++;
        report.bytes += stat.size;
        const extension = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
        if (!SITE_EXTENSIONS.includes(extension)) bad(`ending not allowed: ${shown}`);
        if (shown === "practice.json") bad("practice.json is reserved");
        if (extension === "html" && !/<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(readFileSync(path, "utf8"))) {
          bad(`no noindex: ${shown}`);
        }
      } else bad(`not a plain file: ${shown}`);
    }
  };
  if (!existsSync(join(dir, "index.html"))) bad("index.html is missing");
  else walk(dir);
  if (report.files > MAX_SITE_FILES) bad(`more than ${MAX_SITE_FILES} files`);
  if (report.bytes > MAX_SITE_BYTES) bad(`more than ${MAX_SITE_BYTES / 1024 / 1024} MB`);
  return report;
}

export interface Practice {
  version: 1;
  issue: number;
  fach: string;
  klassenstufe: string;
  bundesland: string;
  erstellt: string;
  laeuftAb: string;
  built: string;
}

/** The record next to the preview: its metadata, the day it was made and the day it ends. expire reads it. */
export function practiceRecord(meta: NonNullable<Result["meta"]>, built: string, now: Date): Practice {
  const created = now.toISOString();
  const ends = new Date(now.getTime() + LIFETIME_DAYS * 24 * 3600 * 1000).toISOString();
  return {
    version: 1,
    issue: meta.issue,
    fach: meta.fach,
    klassenstufe: meta.klassenstufe,
    bundesland: meta.bundesland,
    erstellt: created,
    laeuftAb: ends,
    built,
  };
}

const ROOT_PAGE = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Vorübergehende Vorschauen</title>
  </head>
  <body>
    <main>
      <h1>Vorübergehende Vorschauen</h1>
      <p>Hier liegen Vorschauen von Lern-Apps, die Familien eingereicht haben. Sie werden nach zwei Wochen gelöscht.</p>
      <p><a href="https://github.com/lernapps/practice">Mehr dazu im Repo lernapps/practice</a></p>
    </main>
  </body>
</html>
`;

/** Writes the preview into the checkout of gh-pages: replaces i/<issue>/, keeps .nojekyll and a root page. */
export function writePreview(pagesDir: string, siteDir: string, issue: number, record: Practice): void {
  const target = join(pagesDir, "i", String(issue));
  rmSync(target, { recursive: true, force: true });
  mkdirSync(join(pagesDir, "i"), { recursive: true });
  cpSync(siteDir, target, { recursive: true });
  writeFileSync(join(target, "practice.json"), `${JSON.stringify(record, null, 2)}\n`);
  if (!existsSync(join(pagesDir, ".nojekyll"))) writeFileSync(join(pagesDir, ".nojekyll"), "");
  if (!existsSync(join(pagesDir, "index.html"))) writeFileSync(join(pagesDir, "index.html"), ROOT_PAGE);
}

/** Whether the preview's address serves this build, within the timeout. */
async function served(url: string, built: string, seconds: number): Promise<boolean> {
  const start = Date.now();
  for (;;) {
    try {
      const response = await fetch(`${url}practice.json?built=${encodeURIComponent(built)}`, { headers: { "cache-control": "no-cache" } });
      if (response.ok && ((await response.json()) as Partial<Practice>).built === built) return true;
    } catch {
      // not yet
    }
    if (Date.now() - start >= seconds * 1000) return false;
    await new Promise((done) => setTimeout(done, 10_000));
  }
}

const readJson = <T>(path: string): T | undefined => {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return undefined;
  }
};

export async function publish(env: NodeJS.ProcessEnv, api: Api & { repo: string }): Promise<number> {
  if (!/^[1-9]\d{0,8}$/.test(env["ISSUE_NUMBER"] ?? "")) throw new Error("ISSUE_NUMBER is not an issue number");
  const issue = Number(env["ISSUE_NUMBER"]);
  const result = readJson<Result>(join(resolve(env["INTAKE_DIR"] || "_intake"), "result.json"));
  if (result === undefined || result.issue !== issue) throw new Error("the intake left no result for this issue");
  if (!result.relevant) {
    console.log(`issue #${issue} is not a submission: nothing to do`);
    return 0;
  }
  if (result.unchanged) {
    console.log(`issue #${issue}: same ZIP address and fields as the last run, nothing to do`);
    return 0;
  }
  if (!result.ok || result.meta === undefined) {
    await upsertComment(api, api.repo, issue, COMMENT_MARKER, problemsComment(result.problems));
    console.log(`issue #${issue}: ${result.problems.length} problem(s) written to the comment`);
    return 0;
  }
  const runUrl = env["RUN_URL"] ?? "";
  const info = readJson<{ stage?: string; log?: string }>(join(resolve(env["BUILD_DIR"] || "_buildinfo"), "build.json"));
  const siteDir = resolve(env["SITE_DIR"] || "_site");
  if (env["BUILD_RESULT"] !== "success" || !existsSync(siteDir)) {
    const text = buildFailedComment(info?.log ?? "Es liegt kein Protokoll vor.", runUrl);
    await upsertComment(api, api.repo, issue, COMMENT_MARKER, `${text}\n\n${fingerprintLine(result.fingerprint ?? "")}`);
    console.log(`issue #${issue}: the build failed at ${info?.stage ?? "?"}; the comment says so`);
    return 0;
  }
  const report = checkSite(siteDir);
  if (report.problems.length > 0) {
    throw new Error(`the built site is not allowed on gh-pages:\n  ${report.problems.join("\n  ")}`);
  }

  const built = `${env["GITHUB_RUN_ID"] ?? "0"}.${env["GITHUB_RUN_ATTEMPT"] ?? "0"}`;
  const record = practiceRecord(result.meta, built, new Date());
  const remote = env["PRACTICE_REMOTE"] || `https://github.com/${api.repo}.git`;
  const pushed = await changeBranch(
    {
      remote,
      dir: resolve(env["PAGES_DIR"] || "_pages"),
      token: env["PRACTICE_REMOTE"] ? undefined : env["GITHUB_TOKEN"],
      message: `preview of issue #${issue}`,
    },
    (dir) => writePreview(dir, siteDir, issue, record),
  );
  console.log(`gh-pages: i/${issue}/ written (${report.files} files, ${(report.bytes / 1024).toFixed(0)} kB, ${pushed.attempts} attempt(s))`);

  const address = env["PRACTICE_ADDRESS"] || (await pagesAddress(api, api.repo));
  const link = `${address}i/${issue}/`;
  const timeout = Number(env["LERNAPPS_PUBLISH_TIMEOUT"] ?? "300");
  const ready = await served(link, built, Number.isFinite(timeout) ? timeout : 300);
  if (!ready) console.log(`::warning::${link} does not serve this build yet; the comment says so`);
  await upsertComment(api, api.repo, issue, COMMENT_MARKER, `${previewComment(link, record.laeuftAb, ready)}\n\n${fingerprintLine(result.fingerprint ?? "")}`);
  console.log(`issue #${issue}: ${link}`);
  return 0;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await publish(process.env, apiFromEnv());
  } catch (error) {
    console.error(`::error::publish: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
