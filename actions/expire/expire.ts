#!/usr/bin/env node
// Lets previews expire (action `expire`): looks at every folder i/<n>/ on the branch gh-pages and deletes the ones
// that are over. The rules (docs/lebensdauer.md says the same for people):
//   - The issue is closed                          -> delete now. No comment: someone closed it on purpose.
//   - The day in practice.json (laeuftAb) has not come -> keep.
//   - The day has come and the issue has a 👍 from an account that is not a bot -> keep (until the issue is closed).
//   - The day has come, no such 👍                  -> delete, and write a short note in the issue.
//   - The issue does not exist (any more)           -> as above, after the day, without a note.
//   - No readable practice.json, or one for another issue -> delete now: the writer (publish) puts the record in with
//                                                      the files in one commit, so such a folder was never ours.
//   - Entries of i/ whose name is not a number, and everything outside i/ -> never touched.
// The date comes from practice.json, never from the time of a commit (the branch is rewritten with every change).
//
//   node actions/expire/expire.ts
// Environment: GITHUB_TOKEN, GITHUB_REPOSITORY, ISSUE_NUMBER (optional: only this issue's folder), DRY_RUN (true: change
// and comment nothing, print what would happen), PAGES_DIR (_pages), NOW (an ISO time, tests only), PRACTICE_REMOTE
// (a git address instead of GitHub, tests only).
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { apiFromEnv, expiredComment, EXPIRED_MARKER, forgetFingerprint, paginate, upsertComment, type Api } from "../lib/github.ts";
import { changeBranch } from "../lib/pages.ts";

export type Decision =
  | { action: "keep"; reason: "not-yet" | "thumbs-up" }
  | { action: "delete"; reason: "closed" | "expired" | "expired-no-issue" | "no-record"; notify: boolean };

export interface Facts {
  /** practice.json, or undefined when missing or unreadable */
  record: { issue?: unknown; laeuftAb?: unknown } | undefined;
  folder: number;
  /** "open", "closed", or "missing" when the issue does not exist */
  state: string;
  /** reactions 👍 from accounts that are not bots */
  thumbs: number;
  now: Date;
}

/** The whole policy in one function. */
export function decide(facts: Facts): Decision {
  const { record, folder, state, thumbs, now } = facts;
  const ends = typeof record?.laeuftAb === "string" ? Date.parse(record.laeuftAb) : NaN;
  if (record === undefined || record.issue !== folder || Number.isNaN(ends)) {
    return { action: "delete", reason: "no-record", notify: false };
  }
  if (state === "closed") return { action: "delete", reason: "closed", notify: false };
  if (now.getTime() < ends) return { action: "keep", reason: "not-yet" };
  if (state === "missing") return { action: "delete", reason: "expired-no-issue", notify: false };
  if (thumbs > 0) return { action: "keep", reason: "thumbs-up" };
  return { action: "delete", reason: "expired", notify: true };
}

interface Reaction {
  user?: { type?: string; login?: string } | null;
}

/** Thumbs-up reactions on the issue (the first field) from accounts that are not bots. */
export async function humanThumbs(api: Api, repo: string, issue: number): Promise<number> {
  const rows = await paginate<Reaction>(api, `/repos/${repo}/issues/${issue}/reactions?content=%2B1`);
  return rows.filter((row) => row.user && row.user.type !== "Bot" && !/\[bot\]$/.test(row.user.login ?? "")).length;
}

async function issueState(api: Api, repo: string, issue: number): Promise<string> {
  const response = await api.request("GET", `/repos/${repo}/issues/${issue}`);
  if (response.status === 404 || response.status === 410) return "missing";
  if (response.status !== 200) throw new Error(`cannot read issue #${issue} (${response.status})`);
  return String((response.body as { state?: unknown }).state);
}

export interface Outcome {
  folder: number;
  decision: Decision;
}

/** Decides for every folder of i/ in `pagesDir` (or only `only`) and removes the ones to delete. */
export async function sweep(pagesDir: string, api: Api, repo: string, now: Date, only?: number): Promise<Outcome[]> {
  const root = join(pagesDir, "i");
  if (!existsSync(root)) return [];
  const outcomes: Outcome[] = [];
  for (const name of readdirSync(root).sort((a, b) => Number(a) - Number(b))) {
    if (!/^[1-9]\d{0,8}$/.test(name)) continue; // not ours
    const folder = Number(name);
    if (only !== undefined && folder !== only) continue;
    let record: Facts["record"];
    try {
      record = JSON.parse(readFileSync(join(root, name, "practice.json"), "utf8")) as Facts["record"];
    } catch {
      record = undefined;
    }
    const state = record === undefined ? "missing" : await issueState(api, repo, folder);
    const thumbs = record !== undefined && state === "open" ? await humanThumbs(api, repo, folder) : 0;
    const decision = decide({ record, folder, state, thumbs, now });
    if (decision.action === "delete") rmSync(join(root, name), { recursive: true, force: true });
    outcomes.push({ folder, decision });
  }
  return outcomes;
}

export async function expire(env: NodeJS.ProcessEnv, api: Api & { repo: string }): Promise<Outcome[]> {
  const dryRun = env["DRY_RUN"] === "true";
  const raw = env["ISSUE_NUMBER"] ?? "";
  if (raw !== "" && !/^[1-9]\d{0,8}$/.test(raw)) throw new Error("ISSUE_NUMBER is not an issue number");
  const only = raw === "" ? undefined : Number(raw);
  const now = env["NOW"] ? new Date(env["NOW"]) : new Date();
  let outcomes: Outcome[] = [];
  const result = await changeBranch(
    {
      remote: env["PRACTICE_REMOTE"] || `https://github.com/${api.repo}.git`,
      dir: resolve(env["PAGES_DIR"] || "_pages"),
      token: env["PRACTICE_REMOTE"] ? undefined : env["GITHUB_TOKEN"],
      message: "remove previews that are over",
      dryRun,
    },
    async (dir) => {
      outcomes = await sweep(dir, api, api.repo, now, only);
      return outcomes.some((o) => o.decision.action === "delete");
    },
  );
  const lines = outcomes.map((o) => `#${o.folder}: ${o.decision.action} (${o.decision.reason})`);
  console.log(lines.length === 0 ? "no previews on gh-pages" : lines.join("\n"));
  console.log(dryRun ? "dry run: nothing was changed or written" : result.pushed ? "gh-pages updated" : "gh-pages unchanged");
  if (env["GITHUB_STEP_SUMMARY"]) {
    appendFileSync(env["GITHUB_STEP_SUMMARY"], `### Expire${dryRun ? " (dry run)" : ""}\n\n${lines.map((l) => `- ${l}`).join("\n") || "- no previews"}\n`);
  }
  if (!dryRun) {
    for (const o of outcomes) {
      if (o.decision.action === "delete" && o.decision.notify) {
        await upsertComment(api, api.repo, o.folder, EXPIRED_MARKER, expiredComment());
        await forgetFingerprint(api, api.repo, o.folder); // an edit of the issue builds the preview again
      }
    }
  }
  return outcomes;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await expire(process.env, apiFromEnv());
  } catch (error) {
    console.error(`::error::expire: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
