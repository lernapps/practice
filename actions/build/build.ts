#!/usr/bin/env node
// The build of a submission (action `build`, job `build`: contents: read, no secrets, no issues: write). Three
// commands; the action calls them in this order, with `npm ci` between the first two:
//
//   pin                        outputs repository and commit of app-templates from package.json (appTemplates)
//   prepare <tree> <app-src>   replaces the template's src/ by the submitted tree, keeping the template's main.ts
//   run <app-dir> <out-dir>    npm run build, `lernapps check` on the bundle, noindex on every page; writes
//                              <out-dir>/site/ and <out-dir>/build.json (ok, stage, log tail, seconds)
//
// What the submission may contain was checked by validate; `prepare` checks the tree again, because a tree travels
// between jobs as an artifact. Only Node's own modules.
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pathProblem } from "../lib/zip.ts";

export const NOINDEX = '<meta name="robots" content="noindex">';

/** The page with a robots meta tag noindex in its <head>; an existing robots tag is replaced. */
export function noindex(html: string): string {
  const robots = /<meta\b[^>]*\bname\s*=\s*["']?robots["']?[^>]*>/i;
  if (robots.test(html)) return html.replace(robots, NOINDEX);
  if (!/<\/head>/i.test(html)) throw new Error("a page has no </head>: cannot mark it noindex");
  return html.replace(/<\/head>/i, `  ${NOINDEX}\n  </head>`);
}

/** Marks every .html file below `dir`; returns how many. A page that cannot be marked stops the build. */
export function noindexAll(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const file = join(entry.parentPath, entry.name);
    writeFileSync(file, noindex(readFileSync(file, "utf8")));
    count++;
  }
  return count;
}

/** Every file below `dir` as a path relative to `base`; throws on anything that is not a plain file or folder. */
function walk(dir: string, base: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw new Error(`${relative(base, path)} is a link`);
    if (stat.isDirectory()) found.push(...walk(path, base).concat(`${relative(base, path)}/`));
    else if (stat.isFile()) found.push(relative(base, path));
    else throw new Error(`${relative(base, path)} is not a plain file`);
  }
  return found;
}

/** The template's src/ becomes the submitted tree; main.ts stays. `tree` holds src/ (the unpacked ZIP file). */
export function prepare(tree: string, appSrc: string): number {
  const entries = walk(tree, tree);
  for (const path of entries) {
    const isDirectory = path.endsWith("/");
    const bad = pathProblem(path, !isDirectory);
    if (bad) throw new Error(`the tree is not valid: ${bad.code}: ${path}`);
  }
  if (!existsSync(join(appSrc, "main.ts"))) throw new Error(`${appSrc}/main.ts of the template is missing`);
  for (const name of readdirSync(appSrc)) {
    if (name !== "main.ts") rmSync(join(appSrc, name), { recursive: true, force: true });
  }
  cpSync(join(tree, "src"), appSrc, { recursive: true, errorOnExist: true, force: false });
  return entries.filter((path) => !path.endsWith("/")).length;
}

const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

/**
 * The messages of a failed step for a comment: the first `lines` lines of its output without the parts that tell a
 * person nothing (stack frames "at …", the braces of an error object, npm's tail), without the runner's folder in
 * the paths, without colour and control characters. The messages of the explainer's content check come first in the
 * output (file, line, path, rule), so the head of the output is kept, not its end.
 */
export function messages(log: string, workspace = "", lines = 59): string {
  const kept: string[] = [];
  for (const raw of log.replace(ANSI, "").replaceAll(workspace === "" ? "\u0000" : `${workspace}/`, "").split("\n")) {
    const line = raw.replace(/[^\t\x20-\x7e\u00a0-\uffff]/g, "").trimEnd();
    if (/^\s+at\s/.test(line) || /^\s*errors:\s*\[/.test(line) || /^[{}]\s*$/.test(line)) continue;
    if (/^npm (error|warn|notice)\b/.test(line) || line.startsWith("> ")) continue;
    if (line === "" && (kept.length === 0 || kept[kept.length - 1] === "")) continue;
    kept.push(line);
  }
  while (kept.length > 0 && kept[kept.length - 1] === "") kept.pop();
  const shown = kept.slice(0, lines);
  if (kept.length > lines) shown.push(`… (${kept.length - lines} weitere Zeilen im Protokoll des Laufs)`);
  return shown.join("\n");
}

export interface BuildResult {
  ok: boolean;
  /** build, check, mark or done */
  stage: string;
  log: string;
  seconds: { build: number; check: number };
  pages?: number;
}

function command(cwd: string, file: string, args: string[]): { status: number; output: string; seconds: number } {
  const start = Date.now();
  const run = spawnSync(file, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 15 * 60 * 1000,
    env: { ...process.env, CI: "true", NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  return {
    status: run.status ?? 1,
    output: `${run.stdout ?? ""}${run.stderr ?? ""}${run.error ? `\n${run.error.message}` : ""}`,
    seconds: Math.round((Date.now() - start) / 100) / 10,
  };
}

/** Builds the app, checks the bundle, marks the pages; copies the bundle to `<out>/site`. */
export function run(appDir: string, out: string): BuildResult {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const result: BuildResult = { ok: false, stage: "build", log: "", seconds: { build: 0, check: 0 } };
  const finish = (): BuildResult => {
    writeFileSync(join(out, "build.json"), `${JSON.stringify(result, null, 2)}\n`);
    return result;
  };
  const built = command(appDir, "npm", ["run", "build"]);
  result.seconds.build = built.seconds;
  console.log(built.output);
  if (built.status !== 0) {
    result.log = messages(built.output, appDir);
    return finish();
  }
  const bundle = join(appDir, "_site");
  if (!existsSync(join(bundle, "index.html"))) {
    result.log = "Der Build hat keine Startseite (index.html) geschrieben.";
    return finish();
  }

  // The checks of the built app: `lernapps check <bundle>`, as for a listing, without a catalog entry (docs/pruefungen.md).
  result.stage = "check";
  const checked = command(appDir, "npx", [
    "--no",
    "--",
    "lernapps",
    "check",
    "_site",
    "--report",
    join(resolve(out), "validation-report.yaml"),
  ]);
  result.seconds.check = checked.seconds;
  console.log(checked.output);
  if (checked.status !== 0) {
    result.log = messages(checked.output, appDir);
    return finish();
  }

  // Only now the pages get noindex: the check must see the bundle as it is, including pages nobody links.
  result.stage = "mark";
  try {
    result.pages = noindexAll(bundle);
  } catch (error) {
    result.log = error instanceof Error ? error.message : String(error);
    return finish();
  }
  cpSync(bundle, join(out, "site"), { recursive: true });
  result.stage = "done";
  result.ok = true;
  result.log = messages(checked.output, appDir, 5);
  return finish();
}

function output(name: string, value: string): void {
  const file = process.env["GITHUB_OUTPUT"];
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

function main(args: string[]): number {
  try {
    const [command, ...rest] = args;
    if (command === "pin") {
      const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
        appTemplates?: { repository?: string; commit?: string };
      };
      const pin = manifest.appTemplates;
      if (!pin?.commit || !/^[0-9a-f]{40}$/.test(pin.commit)) throw new Error("package.json: appTemplates.commit is not a commit");
      const repository = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(\.git)?$/.exec(pin.repository ?? "")?.[1];
      if (!repository) throw new Error("package.json: appTemplates.repository is not a GitHub address");
      output("repository", repository);
      output("commit", pin.commit);
      console.log(`app-templates ${repository} at ${pin.commit}`);
      return 0;
    }
    if (command === "prepare" && rest.length === 2) {
      const files = prepare(resolve(rest[0] ?? ""), resolve(rest[1] ?? ""));
      console.log(`src/ of the template replaced by ${files} files of the submission`);
      return 0;
    }
    if (command === "run" && rest.length === 2) {
      const result = run(resolve(rest[0] ?? ""), resolve(rest[1] ?? ""));
      output("ok", String(result.ok));
      console.log(`build: ${result.ok ? "ok" : `failed at ${result.stage}`} (build ${result.seconds.build} s, check ${result.seconds.check} s)`);
      return result.ok ? 0 : 1;
    }
    console.error("Usage: build.ts pin | prepare <tree> <app-src> | run <app-dir> <out-dir>");
    return 2;
  } catch (error) {
    console.error(`::error::build: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
