#!/usr/bin/env node
// A local trial run of a submission: sends a ZIP file through the same checks and the same build as a run on GitHub
// (actions/validate and actions/build) and prints the result the way the bot comments it. Nothing is written to
// GitHub. Like the build on GitHub, it runs the code of the submission's components (their tests and the explainer's
// build), on this machine. The first run takes the template out of @lernapps/app-templates at the version that the
// latest @lernapps/tooling on npm depends on (read now, as the action build reads it) into _templates/ and installs it
// (a few minutes, needs the network); later runs with the same pair reuse it.
//
//   npm run try -- <file.zip>                      exit code 0: the ZIP file passes; 1: the bot would report problems
//   npm run try -- <file.zip> --tooling <version>  the same with another version of @lernapps/tooling
//
// The built site lands in _out/site; look at it with: python3 -m http.server -d _out/site 8000
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFailedComment, problemsComment, previewComment } from "../actions/lib/github.ts";
import { extractZip, inspectZip } from "../actions/lib/zip.ts";
import { appFromTemplate, prepare, readPin, run, TEMPLATES, type BuildResult, type Pin } from "../actions/build/build.ts";

const root = resolve(fileURLToPath(import.meta.url), "../..");

/** Builds the unpacked tree (its src/) into `out`; the default does what the action `build` does. */
export type Builder = (tree: string, out: string) => BuildResult;

function sh(cwd: string, file: string, args: string[]): void {
  const done = spawnSync(file, args, { cwd, stdio: "inherit" });
  if (done.status !== 0) throw new Error(`${file} ${args.join(" ")} failed in ${cwd}`);
}

/**
 * The app of the template of @lernapps/app-templates at the pin, installed like the action does, in
 * _templates/<templates>-<tooling>/: the package unpacked from npm, its folder explainer/ as the app, npm install.
 */
export function ensureTemplates(pin: Pin, base = root): string {
  const dir = join(base, "_templates", `${pin.templates}-${pin.tooling}`);
  const app = join(dir, "app");
  const done = join(dir, "installed");
  if (!existsSync(done)) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    sh(dir, "npm", ["pack", `${TEMPLATES}@${pin.templates}`, "--silent", "--ignore-scripts", "--pack-destination", "."]);
    const tarball = readdirSync(dir).find((name) => name.endsWith(".tgz"));
    if (tarball === undefined) throw new Error(`npm pack of ${TEMPLATES}@${pin.templates} wrote no tarball`);
    sh(dir, "tar", ["-xzf", tarball]);
    appFromTemplate(join(dir, "package"), app, pin);
    sh(app, "npm", ["install", "--no-audit", "--no-fund"]);
    writeFileSync(done, "");
  }
  return app;
}

export const buildAt = (pin: Pin): Builder => (tree, out) => {
  const app = ensureTemplates(pin);
  const files = prepare(tree, join(app, "src"));
  console.log(`src/ of the template replaced by ${files} files of the submission`);
  return run(app, out);
};

/**
 * Checks and builds a ZIP file; `say` receives the text the bot would comment. Returns the exit code.
 * The intake checks come first (as the job `intake`), then the build with the check of the bundle (the job `build`).
 */
export function tryZip(zipPath: string, say: (text: string) => void, build: Builder, work = join(root, "_intake")): number {
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
  say(`${previewComment("<die Adresse der Vorschau>", new Date(Date.now() + 14 * 86400_000).toISOString(), true)}\n\n(Lokal gebaut: _out/site, ${result.pages ?? 0} Seiten. ${result.seconds.test === undefined ? "" : `Tests ${result.seconds.test} s, `}Bau ${result.seconds.build} s, Prüfung ${result.seconds.check} s. Prüfung ohne Befund.)`);
  return 0;
}

/** The arguments of `npm run try`: the ZIP file and, after --tooling, a version of @lernapps/tooling. */
export function parseArgs(args: readonly string[]): { zip?: string; tooling?: string } {
  const at = args.indexOf("--tooling");
  const tooling = at >= 0 ? args[at + 1] : undefined;
  const zip = args.filter((_arg, i) => at < 0 || (i !== at && i !== at + 1))[0];
  return { ...(zip === undefined ? {} : { zip }), ...(tooling === undefined ? {} : { tooling }) };
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { zip, tooling } = parseArgs(process.argv.slice(2));
  if (zip === undefined || !existsSync(zip) || (process.argv.includes("--tooling") && tooling === undefined)) {
    console.error("Usage: npm run try -- <file.zip> [--tooling <version of @lernapps/tooling>]");
    process.exitCode = 2;
  } else {
    try {
      const pin = await readPin(fetch, tooling);
      console.log(`tooling ${pin.tooling}${tooling ? " (given)" : " (latest)"}, app-templates ${pin.templates}`);
      process.exitCode = tryZip(resolve(zip), (text) => console.log(`\n--- So kommentiert der Bot ---\n\n${text}\n`), buildAt(pin));
    } catch (error) {
      console.error(`try: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
}
