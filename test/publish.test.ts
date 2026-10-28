import assert from "node:assert/strict";
import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { describe, it } from "node:test";
import { pagesAddress } from "../actions/lib/github.ts";
import { changeBranch } from "../actions/lib/pages.ts";
import { checkSite, practiceRecord, publish } from "../actions/publish/publish.ts";
import { bareRemote, commitCount, fakeApi, git, pagesFile, pagesFiles, tmp } from "./support.ts";

const NOINDEX_PAGE = '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"></head><body>x</body></html>';

function site(extra: Record<string, string> = {}): string {
  const dir = tmp();
  mkdirSync(join(dir, "assets"), { recursive: true });
  writeFileSync(join(dir, "index.html"), NOINDEX_PAGE);
  writeFileSync(join(dir, "assets/index-abc123.js"), "console.log(1)");
  writeFileSync(join(dir, "assets/_plugin-vue_export-helper.js"), "export {}"); // starts with _ : needs .nojekyll
  for (const [name, data] of Object.entries(extra)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), data);
  }
  return dir;
}

const META = { issue: 5, fach: "Religion", klassenstufe: "7", bundesland: "Hessen", erstellt: "2026-10-27T10:00:00.000Z" };

describe("checkSite", () => {
  it("passes the site of a build", () => assert.deepEqual(checkSite(site()).problems, []));
  it("needs index.html", () => assert.ok(checkSite(tmp()).problems.includes("index.html is missing")));
  it("refuses links, hidden files, other endings, odd names and a page without noindex", () => {
    const dir = site({ ".hidden": "x", "run.sh": "x", "a b.js": "x", "p.html": "<html><head></head></html>" });
    symlinkSync("/etc/passwd", join(dir, "l.txt"));
    const problems = checkSite(dir).problems.join("\n");
    assert.match(problems, /\.hidden/);
    assert.match(problems, /ending not allowed: run\.sh/);
    assert.match(problems, /a b\.js/);
    assert.match(problems, /link: l\.txt/);
    assert.match(problems, /no noindex: p\.html/);
  });
  it("keeps practice.json for itself", () => {
    assert.match(checkSite(site({ "practice.json": "{}" })).problems.join(), /reserved/);
  });
  it("counts files and bytes", () => {
    const report = checkSite(site());
    assert.equal(report.files, 3);
    assert.ok(report.bytes > 0);
  });
});

describe("practice.json", () => {
  it("has the metadata, the day it was made and the day it ends (14 days later)", () => {
    const record = practiceRecord(META, "12.1", new Date("2026-10-27T10:00:00Z"));
    assert.equal(record.erstellt, "2026-10-27T10:00:00.000Z");
    assert.equal(record.laeuftAb, "2026-11-10T10:00:00.000Z");
    assert.equal(record.fach, "Religion");
    assert.equal(record.issue, 5);
  });
});

describe("changeBranch", () => {
  it("creates gh-pages as one commit without parents, and again, keeping a single commit", async () => {
    const remote = bareRemote();
    const options = { remote, dir: join(tmp(), "w"), message: "m" };
    assert.equal(pagesFiles(remote), undefined);
    const first = await changeBranch(options, (dir) => writeFileSync(join(dir, "a.txt"), "1"));
    assert.deepEqual([first.changed, first.pushed], [true, true]);
    await changeBranch({ ...options, dir: join(tmp(), "w2") }, (dir) => writeFileSync(join(dir, "b.txt"), "2"));
    assert.deepEqual(pagesFiles(remote), ["a.txt", "b.txt"]);
    assert.equal(commitCount(remote), 1);
  });

  it("pushes nothing when nothing changed", async () => {
    const remote = bareRemote();
    const options = { remote, dir: join(tmp(), "w"), message: "m" };
    await changeBranch(options, (dir) => writeFileSync(join(dir, "a.txt"), "1"));
    const before = git(remote, "rev-parse", "gh-pages");
    const result = await changeBranch(options, () => undefined);
    assert.equal(result.pushed, false);
    assert.equal(git(remote, "rev-parse", "gh-pages"), before);
  });

  it("does not push in a dry run", async () => {
    const remote = bareRemote();
    const result = await changeBranch({ remote, dir: join(tmp(), "w"), message: "m", dryRun: true }, (dir) => writeFileSync(join(dir, "a.txt"), "1"));
    assert.deepEqual([result.changed, result.pushed], [true, false]);
    assert.equal(pagesFiles(remote), undefined);
  });

  it("repeats on the new state when another push came in between (the lease fails once)", async () => {
    const remote = bareRemote();
    await changeBranch({ remote, dir: join(tmp(), "w"), message: "m" }, (dir) => writeFileSync(join(dir, "base.txt"), "0"));
    let attempts = 0;
    const result = await changeBranch({ remote, dir: join(tmp(), "w"), message: "m", backoff: 1 }, async (dir) => {
      attempts++;
      writeFileSync(join(dir, `mine.txt`), "mine");
      if (attempts === 1) {
        // somebody else publishes while this run is working
        await changeBranch({ remote, dir: join(tmp(), "other"), message: "other" }, (d) => writeFileSync(join(d, "theirs.txt"), "theirs"));
      }
    });
    assert.equal(result.attempts, 2);
    assert.deepEqual(pagesFiles(remote), ["base.txt", "mine.txt", "theirs.txt"]); // nobody's work was lost
  });

  it("gives up with a message after the attempts", async () => {
    const remote = bareRemote();
    await assert.rejects(
      changeBranch({ remote, dir: join(tmp(), "w"), message: "m", attempts: 2, backoff: 1 }, async (dir) => {
        writeFileSync(join(dir, "mine.txt"), String(Math.random()));
        await changeBranch({ remote, dir: join(tmp(), "o"), message: "o" }, (d) => writeFileSync(join(d, `t${Math.random()}.txt`), "t"));
      }),
      /cannot push gh-pages after 2 attempts/,
    );
  });
});

describe("pagesAddress", () => {
  it("links https even where the Pages setting says http", async () => {
    const api = fakeApi({ "GET /repos/lernapps/practice/pages": () => ({ status: 200, body: { html_url: "http://lernapps.net/practice" } }) });
    assert.equal(await pagesAddress(api, "lernapps/practice"), "https://lernapps.net/practice/");
  });
});

describe("publish", () => {
  async function withPagesServer<T>(built: string, body: (address: string) => Promise<T>): Promise<T> {
    const server = createServer((_, response) => response.end(JSON.stringify({ built })));
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    try {
      const port = (server.address() as { port: number }).port;
      return await body(`http://127.0.0.1:${port}/practice/`);
    } finally {
      server.close();
    }
  }
  const intakeDir = (result: object) => {
    const dir = tmp();
    writeFileSync(join(dir, "result.json"), JSON.stringify(result));
    return dir;
  };
  const env = (more: Record<string, string>): NodeJS.ProcessEnv => ({ ISSUE_NUMBER: "5", GITHUB_RUN_ID: "12", GITHUB_RUN_ATTEMPT: "1", PAGES_DIR: join(tmp(), "pages"), LERNAPPS_PUBLISH_TIMEOUT: "0", ...more });
  const comments = () => fakeApi({ "GET /repos/lernapps/practice/issues/5/comments": () => ({ status: 200, body: [] }), "POST /repos/lernapps/practice/issues/5/comments": () => ({ status: 201 }) });
  const posted = (api: ReturnType<typeof comments>) => (api.calls.find((c) => c.method === "POST")?.body as { body: string } | undefined)?.body ?? "";

  it("writes the site to i/<n>/ with practice.json, .nojekyll and a root page, and comments the link", async () => {
    const remote = bareRemote();
    const api = comments();
    const result = { version: 1, issue: 5, relevant: true, ok: true, fingerprint: "a".repeat(64), problems: [], meta: META };
    await withPagesServer("12.1", async (address) => {
      await publish(env({ INTAKE_DIR: intakeDir(result), SITE_DIR: site(), BUILD_RESULT: "success", PRACTICE_REMOTE: remote, PRACTICE_ADDRESS: address, LERNAPPS_PUBLISH_TIMEOUT: "5" }), api);
    });
    const files = pagesFiles(remote) ?? [];
    for (const file of [".nojekyll", "index.html", "i/5/index.html", "i/5/practice.json", "i/5/assets/_plugin-vue_export-helper.js"]) assert.ok(files.includes(file), file);
    const record = JSON.parse(pagesFile(remote, "i/5/practice.json"));
    assert.equal(record.issue, 5);
    assert.equal(record.built, "12.1");
    assert.equal(Date.parse(record.laeuftAb) - Date.parse(record.erstellt), 14 * 24 * 3600 * 1000);
    const text = posted(api);
    assert.match(text, /^<!-- lernapps-practice -->/);
    assert.match(text, /Deine Vorbereitung ist unter http:\/\/127\.0\.0\.1:\d+\/practice\/i\/5\/ erreichbar\.\n\nSo hilft sie am meisten: Dein Kind sieht zuerst selbst sein Material durch und überlegt, was es für die Arbeit können muss\. Danach zeigt ihm die App, was schon sitzt und wo noch Lücken sind\. Sie prüft den Lernstand\. Das Lernen selbst ersetzt sie nicht\.\n\nDas ist eine vorübergehende Vorschau\. Sie wird nach zwei Wochen \(am \d+\. \w+ 2026\) automatisch gelöscht\. Wenn sie Dir oder Deinem Kind geholfen hat, setze bitte eine 👍-Reaktion auf das erste Feld dieses Issues\. Dann bleibt sie erhalten und wir prüfen, ob sie in den Katalog passt\./);
    assert.ok(text.includes(`<!-- lernapps-practice-input: ${"a".repeat(64)} -->`));
    assert.ok(!text.includes("Generated by"), "a platform message, no signature of a tool");
    assert.ok(!text.includes("Falls die Seite noch nicht lädt"));
  });

  it("replaces the old state of the same issue and keeps the others", async () => {
    const remote = bareRemote();
    const result = { version: 1, issue: 5, relevant: true, ok: true, problems: [], meta: META };
    const run = async (n: string, s: string) => {
      const r = { ...result, issue: Number(n), meta: { ...META, issue: Number(n) } };
      await publish(env({ ISSUE_NUMBER: n, INTAKE_DIR: intakeDir(r), SITE_DIR: s, BUILD_RESULT: "success", PRACTICE_REMOTE: remote, PRACTICE_ADDRESS: "http://127.0.0.1:1/" }), fakeApi({ [`GET /repos/lernapps/practice/issues/${n}/comments`]: () => ({ status: 200, body: [] }), [`POST /repos/lernapps/practice/issues/${n}/comments`]: () => ({ status: 201 }) }));
    };
    await run("5", site({ "old.txt": "1" }));
    await run("6", site());
    await run("5", site({ "new.txt": "1" }));
    const files = pagesFiles(remote) ?? [];
    assert.ok(files.includes("i/5/new.txt") && !files.includes("i/5/old.txt") && files.includes("i/6/index.html"));
    assert.equal(commitCount(remote), 1);
  });

  it("says in the comment when the address does not serve the build yet", async () => {
    const api = comments();
    await publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 5, relevant: true, ok: true, problems: [], meta: META }), SITE_DIR: site(), BUILD_RESULT: "success", PRACTICE_REMOTE: bareRemote(), PRACTICE_ADDRESS: "http://127.0.0.1:1/" }), api);
    assert.match(posted(api), /Falls die Seite noch nicht lädt/);
  });

  it("lists the problems of an invalid submission and writes nothing to gh-pages", async () => {
    const remote = bareRemote();
    const api = comments();
    const problems = [{ code: "zip-missing", text: "Kein ZIP gefunden. So hängst Du es an: ..." }];
    await publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 5, relevant: true, ok: false, problems }), BUILD_RESULT: "skipped", PRACTICE_REMOTE: remote }), api);
    assert.match(posted(api), /Kein ZIP gefunden\. So hängst Du es an/);
    assert.equal(pagesFiles(remote), undefined);
  });

  it("shows the messages of a failed build in a code block, at most 60 lines, defused", async () => {
    const api = comments();
    const buildinfo = tmp();
    const log = ["src/a.yaml:3: not valid", "```", "@octocat <script>alert(1)</script>", ...Array.from({ length: 80 }, (_, i) => `l${i}`)].join("\n");
    writeFileSync(join(buildinfo, "build.json"), JSON.stringify({ ok: false, stage: "build", log }));
    await publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 5, relevant: true, ok: true, fingerprint: "b".repeat(64), problems: [], meta: META }), BUILD_DIR: buildinfo, BUILD_RESULT: "failure", PRACTICE_REMOTE: bareRemote(), RUN_URL: "https://github.com/lernapps/practice/actions/runs/1" }), api);
    const text = posted(api);
    assert.match(text, /Beim Bauen sind Fehler aufgetreten\. Gib diese Meldungen Deinem Assistenten, er korrigiert den Inhalt\. Hänge die neue ZIP-Datei als Kommentar an dieses Issue an\./);
    const block = text.split("```text\n")[1]?.split("\n```")[0] ?? "";
    assert.ok(block.split("\n").length <= 60);
    assert.ok(block.includes("src/a.yaml:3: not valid"));
    assert.ok(!block.includes("```"));
    assert.ok(!/@octocat/.test(block));
    assert.ok(text.includes(`lernapps-practice-input: ${"b".repeat(64)}`));
  });

  it("does nothing for an issue that is no submission, and for an unchanged one", async () => {
    const api = comments();
    await publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 5, relevant: false, ok: false, problems: [] }), BUILD_RESULT: "skipped" }), api);
    await publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 5, relevant: true, ok: false, unchanged: true, problems: [] }), BUILD_RESULT: "skipped" }), api);
    assert.equal(api.calls.length, 0);
  });

  it("refuses a site that is not allowed, before it touches gh-pages", async () => {
    const remote = bareRemote();
    await assert.rejects(publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 5, relevant: true, ok: true, problems: [], meta: META }), SITE_DIR: site({ "x.exe": "x" }), BUILD_RESULT: "success", PRACTICE_REMOTE: remote }), comments()), /not allowed on gh-pages/);
    assert.equal(pagesFiles(remote), undefined);
  });

  it("refuses a result for another issue and a bad issue number", async () => {
    await assert.rejects(publish(env({ INTAKE_DIR: intakeDir({ version: 1, issue: 9, relevant: true, ok: true, problems: [] }), BUILD_RESULT: "success" }), comments()), /no result for this issue/);
    await assert.rejects(publish(env({ ISSUE_NUMBER: "5; echo", INTAKE_DIR: tmp() }), comments()), /not an issue number/);
  });
});
