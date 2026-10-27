// The branch gh-pages, which GitHub Pages serves: every change is made on a fresh copy of the branch and pushed as ONE
// new commit without a parent (--force-with-lease against the state it started from). Reasons: a removed preview is
// gone from the branch's history too (a child's learning material must not stay in a public history), and the branch
// stays small. If someone else pushed in between, the lease fails and the change is made again on the new state.
// Only Node's own modules and the git command line.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const BRANCH = "gh-pages";

const BOT = {
  GIT_AUTHOR_NAME: "github-actions[bot]",
  GIT_AUTHOR_EMAIL: "41898282+github-actions[bot]@users.noreply.github.com",
  GIT_COMMITTER_NAME: "github-actions[bot]",
  GIT_COMMITTER_EMAIL: "41898282+github-actions[bot]@users.noreply.github.com",
};

function git(dir: string, args: string[], env: NodeJS.ProcessEnv, allowFail = false): { status: number; out: string } {
  const run = spawnSync("git", args, { cwd: dir, encoding: "utf8", env, maxBuffer: 64 * 1024 * 1024 });
  const out = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  if (run.status !== 0 && !allowFail) throw new Error(`git ${args[0]} failed: ${out.trim().split("\n").slice(-3).join(" | ")}`);
  return { status: run.status ?? 1, out };
}

/** The environment for git: the token as an HTTP header for github.com only, not on a command line. */
export function gitEnv(token: string | undefined): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, ...BOT, GIT_TERMINAL_PROMPT: "0" };
  if (token) {
    const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
    env["GIT_CONFIG_COUNT"] = "1";
    env["GIT_CONFIG_KEY_0"] = "http.https://github.com/.extraheader";
    env["GIT_CONFIG_VALUE_0"] = `Authorization: basic ${basic}`;
  }
  return env;
}

export interface ChangeOptions {
  /** A git address: https://github.com/<owner>/<repo>.git, or a path (tests). */
  remote: string;
  /** A folder that does not exist yet, or is replaced. */
  dir: string;
  token?: string | undefined;
  message: string;
  /** Attempts when the push loses against another push. */
  attempts?: number;
  /** Compute the change but do not push. */
  dryRun?: boolean;
  /** Milliseconds to wait before the next attempt (multiplied by the attempt number). */
  backoff?: number;
}

export interface ChangeResult {
  /** The branch changed (or would change, in a dry run). */
  changed: boolean;
  pushed: boolean;
  attempts: number;
}

/**
 * Runs `change` on a checkout of gh-pages in `options.dir` (an empty folder when the branch does not exist yet).
 * `change` returns false when it had nothing to do.
 */
export async function changeBranch(
  options: ChangeOptions,
  change: (dir: string) => boolean | void | Promise<boolean | void>,
): Promise<ChangeResult> {
  const env = gitEnv(options.token);
  const attempts = options.attempts ?? 5;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    rmSync(options.dir, { recursive: true, force: true });
    mkdirSync(dirname(options.dir), { recursive: true });
    mkdirSync(options.dir, { recursive: true });
    git(options.dir, ["init", "--quiet", "--initial-branch", "work"], env);
    git(options.dir, ["config", "core.autocrlf", "false"], env);
    git(options.dir, ["remote", "add", "origin", options.remote], env);
    const fetched = git(options.dir, ["fetch", "--quiet", "--depth", "1", "origin", `refs/heads/${BRANCH}`], env, true);
    let before = "";
    if (fetched.status === 0) {
      before = git(options.dir, ["rev-parse", "FETCH_HEAD"], env).out.trim();
      git(options.dir, ["checkout", "--quiet", "-B", "work", "FETCH_HEAD"], env);
    } else if (!/couldn't find remote ref|not found|does not exist/i.test(fetched.out)) {
      throw new Error(`cannot fetch ${BRANCH}: ${fetched.out.trim().split("\n").slice(-2).join(" | ")}`);
    }
    const result = await change(options.dir);
    git(options.dir, ["add", "--all"], env);
    const dirty = git(options.dir, ["status", "--porcelain"], env).out.trim() !== "";
    if (result === false || !dirty) return { changed: false, pushed: false, attempts: attempt };
    if (options.dryRun) return { changed: true, pushed: false, attempts: attempt };
    const tree = git(options.dir, ["write-tree"], env).out.trim();
    const commit = git(options.dir, ["commit-tree", tree, "-m", options.message], env).out.trim();
    const lease = `--force-with-lease=refs/heads/${BRANCH}:${before}`;
    const pushed = git(options.dir, ["push", "--quiet", lease, "origin", `${commit}:refs/heads/${BRANCH}`], env, true);
    if (pushed.status === 0) return { changed: true, pushed: true, attempts: attempt };
    if (attempt === attempts) throw new Error(`cannot push ${BRANCH} after ${attempts} attempts: ${pushed.out.trim().split("\n").slice(-2).join(" | ")}`);
    await new Promise((done) => setTimeout(done, (options.backoff ?? 3000) * attempt));
  }
  throw new Error("unreachable");
}

/** The root of gh-pages: .nojekyll (so Pages serves files that start with _) and a page that says what this is. */
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

export function ensureRoot(dir: string): void {
  if (!existsSync(join(dir, ".nojekyll"))) writeFileSync(join(dir, ".nojekyll"), "");
  if (!existsSync(join(dir, "index.html"))) writeFileSync(join(dir, "index.html"), ROOT_PAGE);
}
