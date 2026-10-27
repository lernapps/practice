import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { changeBranch } from "../actions/lib/pages.ts";
import { decide, expire, humanThumbs, type Facts } from "../actions/expire/expire.ts";
import { expiredComment, mentionable } from "../actions/lib/github.ts";
import { bareRemote, fakeApi, pagesFiles, tmp } from "./support.ts";

const NOW = new Date("2026-11-20T12:00:00Z");
const record = (issue: number, ends: string) => ({ issue, laeuftAb: ends });
const facts = (more: Partial<Facts>): Facts => ({ record: record(1, "2026-11-10T00:00:00Z"), folder: 1, state: "open", thumbs: 0, now: NOW, ...more });

describe("decide", () => {
  it("keeps a preview before its day", () => {
    assert.deepEqual(decide(facts({ record: record(1, "2026-11-30T00:00:00Z") })), { action: "keep", reason: "not-yet" });
  });
  it("deletes it after its day, with a note", () => {
    assert.deepEqual(decide(facts({})), { action: "delete", reason: "expired", notify: true });
  });
  it("keeps it after its day with a thumbs-up from a person", () => {
    assert.deepEqual(decide(facts({ thumbs: 1 })), { action: "keep", reason: "thumbs-up" });
  });
  it("deletes it at once when the issue is closed, also with a thumbs-up and before its day, without a note", () => {
    assert.deepEqual(decide(facts({ state: "closed", thumbs: 3, record: record(1, "2026-12-31T00:00:00Z") })), { action: "delete", reason: "closed", notify: false });
  });
  it("deletes it after its day when the issue is gone, without a note; keeps it before", () => {
    assert.deepEqual(decide(facts({ state: "missing" })), { action: "delete", reason: "expired-no-issue", notify: false });
    assert.equal(decide(facts({ state: "missing", record: record(1, "2026-12-31T00:00:00Z") })).action, "keep");
  });
  it("deletes a folder without a usable record, or a record for another issue, at once", () => {
    for (const bad of [undefined, { issue: 1 }, { issue: 2, laeuftAb: "2026-12-31T00:00:00Z" }, { issue: 1, laeuftAb: "gestern" }, { issue: 1, laeuftAb: 5 }]) {
      assert.deepEqual(decide(facts({ record: bad })), { action: "delete", reason: "no-record", notify: false }, JSON.stringify(bad));
    }
  });
  it("takes the day of the record, not the time of any commit", () => {
    // the same facts give the same answer however old the branch's commit is: there is no commit time in the facts
    assert.equal(decide(facts({ now: new Date("2026-11-10T00:00:00Z") })).action, "delete");
    assert.equal(decide(facts({ now: new Date("2026-11-09T23:59:59Z") })).action, "keep");
  });
});

describe("the note at expiry", () => {
  it("mentions only a safe login of a person", () => {
    assert.equal(mentionable("eltern-1", "User"), "eltern-1");
    for (const [login, type] of [["eltern", "Bot"], ["a_b", "User"], ["a b", "User"], ["-a", "User"], ["x".repeat(40), "User"], ["@x", "User"], [5, "User"], [undefined, "User"]]) {
      assert.equal(mentionable(login, type), undefined, String(login));
    }
    assert.match(expiredComment("eltern-1"), /^@eltern-1 Deine Vorschau/);
    assert.match(expiredComment("a_b"), /^Deine Vorschau/);
    assert.match(expiredComment(), /^Deine Vorschau/);
  });
  it("asks for feedback and promises nothing for a thumbs-up", () => {
    const text = expiredComment("eltern-1");
    assert.match(text, /was gut war und was gefehlt hat/);
    assert.ok(!/bleibt erhalten|zurück/.test(text));
  });
});

describe("humanThumbs", () => {
  it("counts accounts that are not bots", async () => {
    const api = fakeApi({
      "GET /repos/lernapps/practice/issues/1/reactions": () => ({
        status: 200,
        body: [{ user: { type: "Bot", login: "github-actions[bot]" } }, { user: { type: "User", login: "eltern" } }, { user: { type: "User", login: "other[bot]" } }, { user: null }],
      }),
    });
    assert.equal(await humanThumbs(api, "lernapps/practice", 1), 1);
    assert.match(api.calls[0]?.path ?? "", /content=%2B1/);
  });
});

describe("expire on a branch", () => {
  async function seed(remote: string): Promise<void> {
    await changeBranch({ remote, dir: join(tmp(), "w"), message: "seed" }, (dir) => {
      const folder = (n: string, rec?: object) => {
        mkdirSync(join(dir, "i", n), { recursive: true });
        writeFileSync(join(dir, "i", n, "index.html"), "x");
        if (rec) writeFileSync(join(dir, "i", n, "practice.json"), JSON.stringify(rec));
      };
      folder("1", record(1, "2026-11-10T00:00:00Z")); // over, no thumbs-up -> deleted with a note
      folder("2", record(2, "2026-11-10T00:00:00Z")); // over, thumbs-up -> kept
      folder("3", record(3, "2026-12-10T00:00:00Z")); // not yet -> kept
      folder("4", record(4, "2026-12-10T00:00:00Z")); // closed -> deleted, no note
      folder("5"); // no record -> deleted
      folder("abc", record(0, "2000-01-01T00:00:00Z")); // not a number: untouched
      writeFileSync(join(dir, "index.html"), "root");
      writeFileSync(join(dir, ".nojekyll"), "");
    });
  }
  const issues: Record<string, string> = { "1": "open", "2": "open", "3": "open", "4": "closed" };
  const api = (author: { login: string; type: string } = { login: "eltern-1", type: "User" }) =>
    fakeApi({
      "GET /repos/lernapps/practice/issues/1/reactions": () => ({ status: 200, body: [] }),
      "GET /repos/lernapps/practice/issues/2/reactions": () => ({ status: 200, body: [{ user: { type: "User", login: "eltern" } }] }),
      "GET /repos/lernapps/practice/issues/3/reactions": () => ({ status: 200, body: [] }),
      "GET /repos/lernapps/practice/issues/": (c) => {
        const m = /issues\/(\d+)(\/comments)?/.exec(c.path);
        if (m?.[2]) return { status: 200, body: [] };
        return m && issues[m[1] ?? ""] ? { status: 200, body: { state: issues[m[1] ?? ""], user: author } } : { status: 404 };
      },
      "POST /repos/lernapps/practice/issues/": () => ({ status: 201 }),
    });
  const env = (remote: string, more: Record<string, string> = {}): NodeJS.ProcessEnv => ({ PRACTICE_REMOTE: remote, PAGES_DIR: join(tmp(), "p"), NOW: NOW.toISOString(), ...more });

  it("deletes what is over, keeps the rest, notes only the expired one", async () => {
    const remote = bareRemote();
    await seed(remote);
    const fake = api();
    await expire(env(remote), fake);
    const files = pagesFiles(remote) ?? [];
    assert.deepEqual(files.filter((f) => f.startsWith("i/")).sort(), ["i/2/index.html", "i/2/practice.json", "i/3/index.html", "i/3/practice.json", "i/abc/index.html", "i/abc/practice.json"]);
    assert.ok(files.includes("index.html") && files.includes(".nojekyll"));
    const posts = fake.calls.filter((c) => c.method === "POST");
    assert.equal(posts.length, 1);
    assert.match(posts[0]?.path ?? "", /issues\/1\/comments/);
    assert.match((posts[0]?.body as { body: string }).body, /^<!-- lernapps-practice-expired -->\n@eltern-1 Deine Vorschau ist nach zwei Wochen gelöscht\. Hat sie geholfen\? Setze ein 👍 auf das erste Feld dieses Issues oder schreib kurz, was gut war und was gefehlt hat\. Das hilft uns und anderen\./);
    assert.ok(!(posts[0]?.body as { body: string }).body.includes("Generated by"));
  });

  it("names nobody when the author's login is not safe or is a bot", async () => {
    for (const author of [{ login: "evil<b>x", type: "User" }, { login: "a_b", type: "User" }, { login: "-x", type: "User" }, { login: "renovate[bot]", type: "Bot" }, { login: "helper", type: "Bot" }]) {
      const remote = bareRemote();
      await seed(remote);
      const fake = api(author);
      await expire(env(remote), fake);
      const bodies = fake.calls.filter((c) => c.method === "POST").map((c) => (c.body as { body: string }).body);
      assert.equal(bodies.length, 1, author.login);
      assert.ok(!bodies[0]?.includes("@"), author.login);
      assert.match(bodies[0] ?? "", /^<!-- lernapps-practice-expired -->\nDeine Vorschau ist nach zwei Wochen gelöscht\./);
    }
  });

  it("mentions nobody when the issue is closed (the closed event)", async () => {
    const remote = bareRemote();
    await seed(remote);
    const fake = api();
    await expire(env(remote, { ISSUE_NUMBER: "4" }), fake);
    assert.equal(fake.calls.filter((c) => c.method !== "GET").length, 0);
  });

  it("changes and writes nothing in a dry run", async () => {
    const remote = bareRemote();
    await seed(remote);
    const before = pagesFiles(remote);
    const fake = api();
    const outcomes = await expire(env(remote, { DRY_RUN: "true" }), fake);
    assert.equal(outcomes.filter((o) => o.decision.action === "delete").length, 3);
    assert.deepEqual(pagesFiles(remote), before);
    assert.equal(fake.calls.filter((c) => c.method !== "GET").length, 0);
  });

  it("looks only at one folder when an issue is named (the closed event)", async () => {
    const remote = bareRemote();
    await seed(remote);
    await expire(env(remote, { ISSUE_NUMBER: "4" }), api());
    const folders = new Set((pagesFiles(remote) ?? []).filter((f) => f.startsWith("i/")).map((f) => f.split("/")[1]));
    assert.deepEqual([...folders].sort(), ["1", "2", "3", "5", "abc"]);
  });

  it("creates gh-pages with only the root files when it does not exist yet, but not in a dry run", async () => {
    const remote = bareRemote();
    assert.deepEqual(await expire(env(remote, { DRY_RUN: "true" }), api()), []);
    assert.equal(pagesFiles(remote), undefined);
    assert.deepEqual(await expire(env(remote), api()), []);
    assert.deepEqual(pagesFiles(remote), [".nojekyll", "index.html"]);
    assert.deepEqual(await expire(env(remote), api()), []); // nothing more to do the second time
  });

  it("refuses a bad issue number", async () => {
    await assert.rejects(expire(env(bareRemote(), { ISSUE_NUMBER: "1; x" }), api()), /not an issue number/);
  });
});
