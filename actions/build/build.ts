#!/usr/bin/env node
// The build of a submission (action `build`, job `build`: contents: read, no secrets, no issues: write). Four
// commands; the action calls them in this order, with `npm ci` between the first two:
//
//   pin [<commit>]             outputs repository and commit of app-templates: the pin appTemplates of the package.json
//                              of lernapps/tooling at the commit main is at now, the same that `create` from
//                              tooling#main takes, and that commit as tooling; a commit given replaces the one of
//                              app-templates
//   tooling <app-dir> <commit> after npm ci: @lernapps/tooling at that commit in the app, as `create` gives an app
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

/** The repository whose main holds the pin of app-templates and whose commit checks the bundle. */
export const TOOLING_REPOSITORY = "https://github.com/lernapps/tooling";
/** Where the pin of app-templates is read: the package.json of lernapps/tooling at a commit. */
export const toolingPackage = (commit: string) => `https://raw.githubusercontent.com/lernapps/tooling/${commit}/package.json`;

export interface Pin {
  /** owner/name on GitHub */
  repository: string;
  commit: string;
  /** git URL of the repository */
  url: string;
  /** The commit of lernapps/tooling the pin was read at: the build checks with @lernapps/tooling of this commit. */
  tooling: string;
}

/** Fetches a text from an address; the default is Node's fetch. */
export type Fetcher = (url: string) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;
/** The commit that main of lernapps/tooling is at now; the default asks git (`git ls-remote`, no token). */
export type MainResolver = () => string;

const COMMIT = /^[0-9a-f]{40}$/;

/** The commit of main of lernapps/tooling, from `git ls-remote`. Throws when git cannot tell. */
export const lsRemoteMain: MainResolver = () => {
  const run = spawnSync("git", ["ls-remote", TOOLING_REPOSITORY, "refs/heads/main"], { encoding: "utf8", timeout: 60_000 });
  const commit = /^([0-9a-f]{40})\trefs\/heads\/main$/m.exec(run.stdout ?? "")?.[1];
  if (run.status !== 0 || commit === undefined) {
    throw new Error(`git ls-remote ${TOOLING_REPOSITORY} refs/heads/main failed: ${(run.stderr ?? run.error?.message ?? "").trim() || "no main"}`);
  }
  return commit;
};

/**
 * The pin of app-templates that lernapps/tooling holds on main (appTemplates in its package.json), the one that
 * `npx github:lernapps/tooling#main create` takes, read at the commit main is at now; that commit is also the
 * @lernapps/tooling the build checks with, as an app made now has it. `commit`, when given, replaces the commit of
 * app-templates read (a trial of another state). Throws with a message that says what failed.
 */
export async function readPin(fetcher: Fetcher = fetch, commit?: string, resolveMain: MainResolver = lsRemoteMain): Promise<Pin> {
  if (commit !== undefined && !COMMIT.test(commit)) throw new Error(`${commit} is not a commit (40 hex digits)`);
  let tooling: string;
  try {
    tooling = resolveMain();
    if (!COMMIT.test(tooling)) throw new Error(`${tooling} is not a commit`);
  } catch (error) {
    throw new Error(
      `cannot find the commit of main of lernapps/tooling (${error instanceof Error ? error.message : String(error)}); the build stops, run it again later`,
    );
  }
  const address = toolingPackage(tooling);
  let manifest: { appTemplates?: { repository?: unknown; commit?: unknown } };
  try {
    const response = await fetcher(address);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = JSON.parse(await response.text()) as typeof manifest;
  } catch (error) {
    throw new Error(
      `cannot read the pin of app-templates from ${address} (${error instanceof Error ? error.message : String(error)}); the build stops, run it again later`,
    );
  }
  const pin = manifest.appTemplates;
  const url = typeof pin?.repository === "string" ? pin.repository : "";
  const repository = /^https:\/\/github\.com\/(lernapps\/[\w.-]+?)(\.git)?$/.exec(url)?.[1];
  if (!repository) throw new Error(`${address}: appTemplates.repository is not a repository of lernapps on GitHub`);
  const pinned = typeof pin?.commit === "string" ? pin.commit : "";
  if (!COMMIT.test(pinned)) throw new Error(`${address}: appTemplates.commit is not a commit`);
  return { repository, commit: commit ?? pinned, url, tooling };
}

/** The npm spec of @lernapps/tooling at `commit`, as `create` writes it into an app. */
export const toolingSpec = (commit: string) => `@lernapps/tooling@github:lernapps/tooling#${commit}`;

/**
 * Makes the app at `appDir` (installed with npm ci from the template's lock) use @lernapps/tooling at `commit`:
 * `npm install` of that commit, unless it is installed already. Returns whether it installed.
 */
export function useTooling(appDir: string, commit: string, install = (args: string[]) => command(appDir, "npm", args)): boolean {
  if (!COMMIT.test(commit)) throw new Error(`${commit} is not a commit of lernapps/tooling`);
  if (installedTooling(appDir) === commit) return false;
  const done = install(["install", "--no-audit", "--no-fund", "--save-dev", toolingSpec(commit)]);
  if (done.status !== 0) throw new Error(`npm install of @lernapps/tooling at ${commit} failed:\n${messages(done.output, appDir, 20)}`);
  return true;
}

/** The commit of @lernapps/tooling installed in `appDir`, from npm's lock of node_modules; undefined if unknown. */
export function installedTooling(appDir: string): string | undefined {
  try {
    const lock = JSON.parse(readFileSync(join(appDir, "node_modules", ".package-lock.json"), "utf8")) as {
      packages?: Record<string, { resolved?: string }>;
    };
    return /#([0-9a-f]{40})$/.exec(lock.packages?.["node_modules/@lernapps/tooling"]?.resolved ?? "")?.[1];
  } catch {
    return undefined;
  }
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
  // entry by entry: Node 26 refuses to copy a folder onto one that exists (appSrc keeps main.ts), Node 22 merged them
  for (const name of readdirSync(join(tree, "src"))) {
    cpSync(join(tree, "src", name), join(appSrc, name), { recursive: true, errorOnExist: true, force: false });
  }
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

  // The checks of the built app: `lernapps check <bundle>`, as for a listing, without a catalog entry (docs/checks.md).
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
      output("tooling", pin.tooling);
      console.log(`app-templates ${pin.repository} at ${pin.commit}${rest[0] ? " (given)" : ` (the pin of ${toolingPackage(pin.tooling)})`}; tooling at ${pin.tooling}`);
      return 0;
    }
    if (command === "tooling" && rest.length === 2) {
      const installed = useTooling(resolve(rest[0] ?? ""), rest[1] ?? "");
      console.log(`@lernapps/tooling at ${rest[1]}${installed ? "" : " (installed already)"}`);
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
    console.error("Usage: build.ts pin [<commit>] | tooling <app-dir> <commit> | prepare <tree> <app-src> | run <app-dir> <out-dir>");
    return 2;
  } catch (error) {
    console.error(`::error::build: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
