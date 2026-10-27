// Helpers of the tests: an issue text like the form's, a fake GitHub API, a bare repo as the remote.
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Api } from "../actions/lib/github.ts";

export const tmp = (name = "practice-test-"): string => mkdtempSync(join(tmpdir(), name));

export const URL1 = "https://github.com/user-attachments/files/34026717/vorbereitung.zip";

export function issueBody(overrides: Record<string, string> = {}): string {
  const fields: Record<string, string> = {
    Fach: "Religion",
    Klassenstufe: "7",
    Bundesland: "Hessen",
    "ZIP-Datei": `[vorbereitung.zip](${URL1})`,
    Erklärungen: "- [x] Der Inhalt ist selbst erstellt\n- [x] Der Inhalt enthält keine persönlichen Daten\n- [x] Ich erlaube, dass der Inhalt zwei Wochen lang veröffentlicht wird",
    ...overrides,
  };
  return Object.entries(fields)
    .map(([label, value]) => `### ${label}\n\n${value}`)
    .join("\n\n");
}

export interface Call {
  method: string;
  path: string;
  body?: unknown;
}

/** A fake GitHub API: routes by "METHOD path-prefix"; unknown routes answer 404. Records every call. */
export function fakeApi(routes: Record<string, (call: Call) => { status: number; body?: unknown }> = {}): Api & { repo: string; calls: Call[] } {
  const calls: Call[] = [];
  return {
    repo: "lernapps/practice",
    calls,
    async request(method, path, body) {
      const call: Call = { method, path, ...(body === undefined ? {} : { body }) };
      calls.push(call);
      const key = Object.keys(routes).find((k) => `${method} ${path}`.startsWith(k));
      const answer = key ? routes[key]?.(call) : undefined;
      return answer ?? { status: 404, body: undefined };
    },
  };
}

export function git(dir: string, ...args: string[]): string {
  const run = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (run.status !== 0) throw new Error(`git ${args.join(" ")}: ${run.stderr}`);
  return run.stdout.trim();
}

/** A bare repository to push to; returns its path. */
export function bareRemote(): string {
  const dir = tmp("practice-remote-");
  git(dir, "init", "--quiet", "--bare", "--initial-branch", "main");
  return dir;
}

/** The files on gh-pages of the bare repo, or undefined when the branch does not exist. */
export function pagesFiles(remote: string): string[] | undefined {
  const run = spawnSync("git", ["ls-tree", "-r", "--name-only", "gh-pages"], { cwd: remote, encoding: "utf8" });
  return run.status === 0 ? run.stdout.split("\n").filter(Boolean) : undefined;
}

export function pagesFile(remote: string, path: string): string {
  return git(remote, "show", `gh-pages:${path}`);
}

export function commitCount(remote: string): number {
  return Number(git(remote, "rev-list", "--count", "gh-pages"));
}
