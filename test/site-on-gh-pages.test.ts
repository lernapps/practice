// The branch gh-pages holds three things: the site (the root, published by pages.yml), the previews of the
// submissions (i/<n>/, written by publish and expire) and the previews of pull requests (pr-preview/pr-<n>/, written
// by the action site-preview). These tests check the side of this repo's code: publish and expire never touch the
// site and pr-preview/, and the placeholder page is made only when there is no page.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { expire } from "../actions/expire/expire.ts";
import { changeBranch } from "../actions/lib/pages.ts";
import { publish } from "../actions/publish/publish.ts";
import { bareRemote, commitCount, fakeApi, git, pagesFile, pagesFiles, tmp } from "./support.ts";

const PAGE = '<!doctype html><html><head><meta name="robots" content="noindex"></head><body>x</body></html>';
const META = { issue: 5, fach: "Religion", klassenstufe: "7", bundesland: "Hessen", erstellt: "2026-10-27T10:00:00.000Z" };

/** The site as pages.yml leaves it, the preview of a pull request, and two submissions (7 is over, 8 is not). */
const SEED: Record<string, string> = {
  "index.html": "<html>site de</html>",
  "en/index.html": "<html>site en</html>",
  "regeln/index.html": "<html>regeln</html>",
  "404.html": "<html>404</html>",
  "stil.css": "body{}",
  "llms.txt": "guide",
  ".nojekyll": "",
  "pr-preview/pr-3/index.html": "<html>preview of pr 3</html>",
  "pr-preview/pr-3/en/index.html": "<html>preview of pr 3 en</html>",
  "i/7/index.html": "x",
  "i/7/practice.json": JSON.stringify({ issue: 7, laeuftAb: "2026-11-10T00:00:00Z" }),
  "i/8/index.html": "x",
  "i/8/practice.json": JSON.stringify({ issue: 8, laeuftAb: "2026-12-10T00:00:00Z" }),
};

async function seed(remote: string): Promise<void> {
  await changeBranch({ remote, dir: join(tmp(), "w"), message: "seed" }, (dir) => {
    for (const [path, text] of Object.entries(SEED)) {
      mkdirSync(join(dir, path, ".."), { recursive: true });
      writeFileSync(join(dir, path), text);
    }
  });
}

/** path -> blob id of every file of gh-pages outside i/ */
function outsidePreviews(remote: string): Record<string, string> {
  const rows = git(remote, "ls-tree", "-r", "gh-pages").split("\n").filter(Boolean);
  const files: Record<string, string> = {};
  for (const row of rows) {
    const [meta, path] = row.split("\t") as [string, string];
    if (!path.startsWith("i/")) files[path] = meta.split(" ")[2] ?? "";
  }
  return files;
}

const pagesEnv = (more: Record<string, string>): NodeJS.ProcessEnv => ({ PAGES_DIR: join(tmp(), "pages"), GITHUB_RUN_ID: "1", GITHUB_RUN_ATTEMPT: "1", LERNAPPS_PUBLISH_TIMEOUT: "0", ...more });
const notFound = () => fakeApi({ "GET /repos/lernapps/practice/issues/5/comments": () => ({ status: 200, body: [] }), "POST /repos/lernapps/practice/issues/5/comments": () => ({ status: 201 }) });

describe("gh-pages next to the site and the pull request previews", () => {
  it("publish writes i/<n>/ and leaves the site and pr-preview/ as they are", async () => {
    const remote = bareRemote();
    await seed(remote);
    const before = outsidePreviews(remote);
    const siteDir = tmp();
    writeFileSync(join(siteDir, "index.html"), PAGE);
    const intake = tmp();
    writeFileSync(join(intake, "result.json"), JSON.stringify({ version: 1, issue: 5, relevant: true, ok: true, problems: [], meta: META }));
    await publish(pagesEnv({ ISSUE_NUMBER: "5", INTAKE_DIR: intake, SITE_DIR: siteDir, BUILD_RESULT: "success", PRACTICE_REMOTE: remote, PRACTICE_ADDRESS: "http://127.0.0.1:1/" }), notFound());
    assert.deepEqual(outsidePreviews(remote), before);
    const files = pagesFiles(remote) ?? [];
    assert.ok(files.includes("i/5/index.html") && files.includes("i/7/index.html") && files.includes("i/8/index.html"));
    assert.equal(commitCount(remote), 1);
  });

  it("expire deletes what is over in i/ and leaves the site and pr-preview/ as they are", async () => {
    const remote = bareRemote();
    await seed(remote);
    const before = outsidePreviews(remote);
    const api = fakeApi({
      "GET /repos/lernapps/practice/issues/7/reactions": () => ({ status: 200, body: [] }),
      "GET /repos/lernapps/practice/issues/8/reactions": () => ({ status: 200, body: [] }),
      "GET /repos/lernapps/practice/issues/": (c) => (/comments/.test(c.path) ? { status: 200, body: [] } : { status: 200, body: { state: "open" } }),
      "POST /repos/lernapps/practice/issues/": () => ({ status: 201 }),
    });
    await expire({ PRACTICE_REMOTE: remote, PAGES_DIR: join(tmp(), "p"), NOW: "2026-11-20T12:00:00Z" }, api);
    const files = pagesFiles(remote) ?? [];
    assert.ok(!files.some((f) => f.startsWith("i/7/")), "i/7/ is over");
    assert.ok(files.includes("i/8/index.html"), "i/8/ stays");
    assert.deepEqual(outsidePreviews(remote), before);
  });

  it("makes the placeholder page only when there is no page: the site stays, an empty branch gets the placeholder", async () => {
    const withSite = bareRemote();
    await seed(withSite);
    const api = fakeApi({
      "GET /repos/lernapps/practice/issues/7/reactions": () => ({ status: 200, body: [] }),
      "GET /repos/lernapps/practice/issues/8/reactions": () => ({ status: 200, body: [] }),
      "GET /repos/lernapps/practice/issues/": () => ({ status: 200, body: { state: "open" } }),
      "POST /repos/lernapps/practice/issues/": () => ({ status: 201 }),
    });
    await expire({ PRACTICE_REMOTE: withSite, PAGES_DIR: join(tmp(), "p"), NOW: "2026-01-01T00:00:00Z" }, api);
    assert.equal(pagesFile(withSite, "index.html"), "<html>site de</html>");

    const empty = bareRemote();
    await expire({ PRACTICE_REMOTE: empty, PAGES_DIR: join(tmp(), "p"), NOW: "2026-01-01T00:00:00Z" }, fakeApi());
    assert.match(pagesFile(empty, "index.html"), /Vorübergehende Vorschauen/);
    assert.deepEqual((pagesFiles(empty) ?? []).sort(), [".nojekyll", "index.html"]);
  });
});
