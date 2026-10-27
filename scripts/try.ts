#!/usr/bin/env node
// A local trial run of a submission: sends a ZIP file through the same checks and the same build as a run on GitHub
// (actions/validate and actions/build) and prints the result the way the bot comments it. Nothing is written to
// GitHub; the ZIP file is not run. The first run fetches app-templates at the commit that package.json pins into
// _templates/ and installs it (a few minutes, needs the network); later runs reuse it.
//
//   npm run try -- <file.zip>         exit code 0: the ZIP file passes; 1: the bot would report problems
//
// The built site lands in _out/site; look at it with: python3 -m http.server -d _out/site 8000
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFailedComment, problemsComment, previewComment } from "../actions/lib/github.ts";
import { extractZip, inspectZip } from "../actions/lib/zip.ts";
import { prepare, run, type BuildResult } from "../actions/build/build.ts";

const root = resolve(fileURLToPath(import.meta.url), "../..");

/** Builds the unpacked tree (its src/) into `out`; the default does what the action `build` does. */
export type Builder = (tree: string, out: string) => BuildResult;

function sh(cwd: string, file: string, args: string[]): void {
  const done = spawnSync(file, args, { cwd, stdio: "inherit" });
  if (done.status !== 0) throw new Error(`${file} ${args.join(" ")} failed in ${cwd}`);
}

/** app-templates at the pinned commit in _templates/, installed like the action does (root first, then explainer/). */
export function ensureTemplates(base = root): string {
  const pin = (JSON.parse(readFileSync(join(base, "package.json"), "utf8")) as { appTemplates: { repository: string; commit: string } }).appTemplates;
  const dir = join(base, "_templates");
  const head = () => spawnSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).stdout.trim();
  if (!existsSync(join(dir, ".git")) || head() !== pin.commit) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    sh(dir, "git", ["init", "--quiet"]);
    sh(dir, "git", ["fetch", "--quiet", "--depth", "1", pin.repository, pin.commit]);
    sh(dir, "git", ["checkout", "--quiet", "FETCH_HEAD"]);
  }
  for (const where of [dir, join(dir, "explainer")]) {
    if (!existsSync(join(where, "node_modules"))) sh(where, "npm", ["ci", "--no-audit", "--no-fund"]);
  }
  return join(dir, "explainer");
}

const buildHere: Builder = (tree, out) => {
  const app = ensureTemplates();
  const files = prepare(tree, join(app, "src"));
  console.log(`src/ of the template replaced by ${files} files of the submission`);
  return run(app, out);
};

/**
 * Checks and builds a ZIP file; `say` receives the text the bot would comment. Returns the exit code.
 * The intake checks come first (as the job `intake`), then the build with the check of the bundle (the job `build`).
 */
export function tryZip(zipPath: string, say: (text: string) => void, build: Builder = buildHere, work = join(root, "_intake")): number {
  const buffer = readFileSync(zipPath);
  const inspection = inspectZip(buffer);
  if (inspection.problems.length > 0) {
    say(problemsComment(inspection.problems));
    return 1;
  }
  rmSync(work, { recursive: true, force: true });
  const tree = join(work, "tree");
  const unpack = extractZip(buffer, inspection.entries, tree);
  if (unpack.length > 0) {
    say(problemsComment(unpack));
    return 1;
  }
  const result = build(tree, join(root, "_out"));
  if (!result.ok) {
    say(buildFailedComment(result.log, ""));
    return 1;
  }
  say(`${previewComment("<die Adresse der Vorschau>", new Date(Date.now() + 14 * 86400_000).toISOString(), true)}\n\n(Lokal gebaut: _out/site, ${result.pages ?? 0} Seiten. Bau ${result.seconds.build} s, Prüfung ${result.seconds.check} s. Prüfung ohne Befund.)`);
  return 0;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const zip = process.argv[2];
  if (zip === undefined || !existsSync(zip)) {
    console.error("Usage: npm run try -- <file.zip>");
    process.exitCode = 2;
  } else {
    try {
      process.exitCode = tryZip(resolve(zip), (text) => console.log(`\n--- So kommentiert der Bot ---\n\n${text}\n`));
    } catch (error) {
      console.error(`try: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
}
