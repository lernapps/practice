#!/usr/bin/env node
// The build of a submission (action `build`, job `build`: contents: read, no secrets, no issues: write). Three
// commands; the action calls them in this order, with `npm ci` between the first two:
//
//   pin [<commit>]             outputs repository and commit of app-templates: the pin appTemplates of the package.json
//                              of lernapps/tooling on main, read now, the same that `create` from tooling#main takes;
//                              a commit given replaces the commit read
//   prepare <tree> <app-src>   replaces the template's src/ by the submitted tree, keeping the template's main.ts
//   run <app-dir> <out-dir>    the components' tests (when there are any), npm run build, `lernapps check` on the
//                              bundle, noindex on every page; writes <out-dir>/site/ and <out-dir>/build.json (ok,
//                              stage, log tail, seconds)
//
// What the submission may contain was checked by validate; `prepare` checks the tree again, because a tree travels
// between jobs as an artifact. The build runs code of the submission: the components' logic and tests, which the
// explainer's build and `vp test` execute, in this job without rights. Only Node's own modules.
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
import { svgProblems } from "../lib/svg.ts";
import { pathProblem } from "../lib/zip.ts";

/** Where the pin of app-templates is read: the package.json of lernapps/tooling on main. */
export const TOOLING_PACKAGE = "https://raw.githubusercontent.com/lernapps/tooling/main/package.json";

export interface Pin {
  /** owner/name on GitHub */
  repository: string;
  commit: string;
  /** git URL of the repository */
  url: string;
}

/** Fetches a text from an address; the default is Node's fetch. */
export type Fetcher = (url: string) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

const COMMIT = /^[0-9a-f]{40}$/;

/**
 * The pin of app-templates that lernapps/tooling holds on main (appTemplates in its package.json), the one that
 * `npx github:lernapps/tooling#main create` takes; `commit`, when given, replaces the commit read (a trial of
 * another state). Throws with a message that says what failed.
 */
export async function readPin(fetcher: Fetcher = fetch, commit?: string): Promise<Pin> {
  if (commit !== undefined && !COMMIT.test(commit)) throw new Error(`${commit} is not a commit (40 hex digits)`);
  let manifest: { appTemplates?: { repository?: unknown; commit?: unknown } };
  try {
    const response = await fetcher(TOOLING_PACKAGE);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = JSON.parse(await response.text()) as typeof manifest;
  } catch (error) {
    throw new Error(
      `cannot read the pin of app-templates from ${TOOLING_PACKAGE} (${error instanceof Error ? error.message : String(error)}); the build stops, run it again later`,
    );
  }
  const pin = manifest.appTemplates;
  const url = typeof pin?.repository === "string" ? pin.repository : "";
  const repository = /^https:\/\/github\.com\/(lernapps\/[\w.-]+?)(\.git)?$/.exec(url)?.[1];
  if (!repository) throw new Error(`${TOOLING_PACKAGE}: appTemplates.repository is not a repository of lernapps on GitHub`);
  const pinned = typeof pin?.commit === "string" ? pin.commit : "";
  if (!COMMIT.test(pinned)) throw new Error(`${TOOLING_PACKAGE}: appTemplates.commit is not a commit`);
  return { repository, commit: commit ?? pinned, url };
}

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
    const bad = pathProblem(path, !isDirectory) ?? (path.endsWith(".svg") ? svgProblems(path, readFileSync(join(tree, path)))[0] : undefined);
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
  /** test, build, check, mark or done */
  stage: string;
  log: string;
  seconds: { test?: number; build: number; check: number };
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
  // The tests of the components (src/components/<Name>.test.ts), as `lernapps check` runs them in an app: the
  // explainer's build only checks that each component has one.
  const components = join(appDir, "src", "components");
  if (existsSync(components) && readdirSync(components).some((name) => name.endsWith(".test.ts"))) {
    result.stage = "test";
    const tested = command(appDir, "npx", ["--no", "--", "vp", "test", "--run"]);
    result.seconds.test = tested.seconds;
    console.log(tested.output);
    if (tested.status !== 0) {
      result.log = messages(tested.output, appDir);
      return finish();
    }
    result.stage = "build";
  }
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

async function main(args: string[]): Promise<number> {
  try {
    const [command, ...rest] = args;
    if (command === "pin" && rest.length <= 1) {
      const pin = await readPin(fetch, rest[0] || undefined);
      output("repository", pin.repository);
      output("commit", pin.commit);
      console.log(`app-templates ${pin.repository} at ${pin.commit}${rest[0] ? " (given)" : ` (the pin of ${TOOLING_PACKAGE})`}`);
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
    console.error("Usage: build.ts pin [<commit>] | prepare <tree> <app-src> | run <app-dir> <out-dir>");
    return 2;
  } catch (error) {
    console.error(`::error::build: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
