import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { curlDownload, intake, maintainerZipUrl, ownerCommentTexts, type Download } from "../actions/validate/validate.ts";
import { buildZip, goodSpecs } from "./zip-builder.ts";
import { issueBody, tmp, URL1 } from "./support.ts";

const serve = (buffer: Buffer): Download => () => ({ buffer });
const never: Download = () => {
  throw new Error("must not download");
};
const run = (body: string, download: Download, extra: Partial<Parameters<typeof intake>[0]> = {}) =>
  intake({ issue: 7, outDir: join(tmp(), "out"), state: "open", body, download, now: new Date("2026-10-27T10:00:00Z"), ...extra });

describe("intake", () => {
  it("accepts a good submission, unpacks src/ and writes meta.json", () => {
    const outDir = join(tmp(), "out");
    const result = intake({ issue: 7, outDir, state: "open", body: issueBody(), download: serve(buildZip(goodSpecs())), now: new Date("2026-10-27T10:00:00Z") });
    assert.equal(result.ok, true);
    assert.equal(result.zip?.files, 5);
    assert.ok(existsSync(join(outDir, "tree/src/app.yaml")));
    const meta = JSON.parse(readFileSync(join(outDir, "meta.json"), "utf8"));
    assert.deepEqual(meta, { issue: 7, subject: "Religion", grade: "7", federalState: "Hessen", created: "2026-10-27T10:00:00.000Z" });
    assert.equal(JSON.parse(readFileSync(join(outDir, "result.json"), "utf8")).ok, true);
  });

  it("ignores an issue that did not come from the form, and a closed one, without a download", () => {
    assert.equal(run("Hallo", never).relevant, false);
    assert.equal(run(issueBody(), never, { state: "closed" }).relevant, false);
    assert.equal(run(issueBody(), never, { state: "pull_request" }).relevant, false);
  });

  it("answers with the help text when there is no ZIP, and downloads nothing", () => {
    const result = run(issueBody({ "ZIP-Datei": "_No response_" }), never);
    assert.equal(result.relevant, true);
    assert.equal(result.ok, false);
    assert.match(result.problems[0]?.text ?? "", /^Kein ZIP gefunden\. So hängst Du es an:/);
  });

  it("collects the problems of the fields and the declarations together, without a download", () => {
    const result = run(issueBody({ Klassenstufe: "99", Fach: "", Erklärungen: "- [ ] a\n- [ ] b\n- [ ] c" }), never);
    assert.deepEqual(result.problems.map((p) => p.code).sort(), ["declarations", "grade", "subject-missing"]);
  });

  it("reports a bad ZIP file, writes no tree and no meta", () => {
    const outDir = join(tmp(), "out");
    const zip = buildZip([{ name: "src/app.yaml", data: "x" }, { name: "src/main.ts", data: "x" }, { name: "src/c.vue", data: "x" }]);
    const result = intake({ issue: 7, outDir, state: "open", body: issueBody(), download: serve(zip) });
    assert.equal(result.ok, false);
    assert.ok(result.problems.length >= 1);
    assert.ok(!existsSync(join(outDir, "tree")));
    assert.ok(!existsSync(join(outDir, "meta.json")));
    assert.ok(existsSync(join(outDir, "result.json")));
  });

  it("reports a lying ZIP file at unpacking and leaves nothing behind", () => {
    const outDir = join(tmp(), "out");
    const zip = buildZip([...goodSpecs(), { name: "src/bomb.yaml", data: Buffer.alloc(5 * 1024 * 1024, 0x61), declaredSize: 10 }]);
    const result = intake({ issue: 7, outDir, state: "open", body: issueBody(), download: serve(zip) });
    assert.equal(result.ok, false);
    assert.equal(result.problems[0]?.code, "bomb");
    assert.ok(!existsSync(join(outDir, "tree")));
  });

  it("passes on a download problem", () => {
    const result = run(issueBody(), () => ({ problem: { code: "download", text: "nicht geladen" } }));
    assert.deepEqual(result.problems.map((p) => p.code), ["download"]);
  });

  it("does not run again for the same ZIP address and fields, unless forced; a changed field runs", () => {
    const first = run(issueBody(), serve(buildZip(goodSpecs())));
    assert.ok(first.fingerprint);
    const same = run(issueBody(), never, { previous: first.fingerprint });
    assert.equal(same.unchanged, true);
    assert.equal(same.ok, false);
    const forced = run(issueBody(), serve(buildZip(goodSpecs())), { previous: first.fingerprint, force: true });
    assert.equal(forced.ok, true);
    const changedField = run(issueBody({ Fach: "Ethik" }), serve(buildZip(goodSpecs())), { previous: first.fingerprint });
    assert.equal(changedField.ok, true);
    const newZip = run(issueBody({ "ZIP-Datei": "https://github.com/user-attachments/files/9/neu.zip" }), serve(buildZip(goodSpecs())), { previous: first.fingerprint });
    assert.equal(newZip.ok, true);
  });

  it("leaves only src/, meta.json and result.json", () => {
    const outDir = join(tmp(), "out");
    intake({ issue: 7, outDir, state: "open", body: issueBody(), download: serve(buildZip([...goodSpecs(), { name: "proj/package.json", data: "{}" }])) });
    assert.deepEqual(readdirSync(outDir).sort(), ["meta.json", "result.json", "tree"]);
    assert.deepEqual(readdirSync(join(outDir, "tree")), ["src"]);
  });
});

describe("a new version in a comment", () => {
  const NEWER = "https://github.com/user-attachments/files/34026999/neu.zip";
  it("loads the newer ZIP file of the author's comment and builds again", () => {
    const loaded: string[] = [];
    const download: Download = (url) => {
      loaded.push(url);
      return { buffer: buildZip(goodSpecs()) };
    };
    const first = run(issueBody(), download);
    const second = run(issueBody(), download, { ownerComments: [`Neue Fassung: [neu.zip](${NEWER})`], previous: first.fingerprint });
    assert.equal(second.ok, true);
    assert.deepEqual(loaded, [URL1, NEWER]);
  });
  it("counts only the comments of the issue's author, never a bot's", () => {
    const rows = [
      { body: "a", user: { id: 1, type: "User" } },
      { body: "b", user: { id: 2, type: "User" } },
      { body: "c", user: { id: 1, type: "Bot" } },
      { body: "d", user: { id: 1, type: "User" } },
    ];
    assert.deepEqual(ownerCommentTexts(rows, 1), ["a", "d"]);
    assert.deepEqual(ownerCommentTexts(rows, undefined), []);
  });
  it("starts a run only for a comment of the issue's author with an attachment", () => {
    const workflow = readFileSync(new URL("../.github/workflows/submission.yml", import.meta.url), "utf8");
    assert.match(workflow, /issue_comment:\n\s+types: \[created, edited\]/);
    assert.match(workflow, /github\.event\.comment\.user\.id == github\.event\.issue\.user\.id && contains\(github\.event\.comment\.body, 'https:\/\/github\.com\/user-attachments\/files\/'\)/);
    assert.match(workflow, /format\('-comment-\{0\}', github\.event\.comment\.id\)/);
  });
});

describe("the download", () => {
  it("loads only the attachment addresses, before it starts curl", () => {
    for (const bad of ["http://github.com/user-attachments/files/1/a.zip", "https://example.com/a.zip", "file:///etc/passwd", "https://github.com/user-attachments/files/1/a.zip?x=1", "-o/etc/x", "https://github.com/user-attachments/files/1/a.zip\nx"]) {
      assert.equal(curlDownload(bad).problem?.code, "zip-url", bad);
    }
  });
});

describe("a maintainer's test run with zip_url", () => {
  const RAW = "https://raw.githubusercontent.com/lernapps/practice/main/test/fixtures/probe.zip";
  it("loads the ZIP file from the address given instead of the issue, and checks it the same way", () => {
    const asked: string[] = [];
    const result = run(issueBody(), (url) => (asked.push(url), { buffer: buildZip(goodSpecs()) }), { zipUrl: RAW, force: true });
    assert.equal(result.ok, true);
    assert.deepEqual(asked, [RAW]);
    assert.equal(result.zip?.url, RAW);
    const bad = run(issueBody(), () => ({ buffer: buildZip([{ name: "src/app.yaml", data: "x" }, { name: "src/a.js", data: "x" }]) }), { zipUrl: RAW });
    assert.ok(bad.problems.some((p) => p.code === "extension"));
  });
  it("needs no ZIP in the issue then", () => {
    const result = run(issueBody({ "ZIP-Datei": "_No response_" }), () => ({ buffer: buildZip(goodSpecs()) }), { zipUrl: RAW });
    assert.equal(result.ok, true);
  });
  it("leaves the issue's address when zip_url is empty", () => {
    const asked: string[] = [];
    run(issueBody(), (url) => (asked.push(url), { buffer: buildZip(goodSpecs()) }), { zipUrl: "" });
    assert.deepEqual(asked, ["https://github.com/user-attachments/files/34026717/preparation.zip"]);
  });
  it("accepts only the fixed prefixes and attachment addresses", () => {
    for (const url of [
      RAW,
      "https://raw.githubusercontent.com/lernapps/tooling/abc123/x/probe.zip",
      "https://raw.githubusercontent.com/mrsimpson/test-lernkontrolle/main/zips/probe-1.zip",
      "https://github.com/user-attachments/files/34026717/preparation.zip",
    ]) {
      assert.equal(maintainerZipUrl(url), true, url);
    }
    for (const url of [
      "https://raw.githubusercontent.com/lernapps-evil/x/main/a.zip",
      "https://raw.githubusercontent.com/mrsimpson/other/main/a.zip",
      "https://raw.githubusercontent.com/mrsimpson/test-lernkontrolle-x/main/a.zip",
      "https://raw.githubusercontent.com/lernapps/../evil/main/a.zip",
      "https://raw.githubusercontent.com/lernapps/x/main/a.zip?x=1",
      "https://raw.githubusercontent.com/lernapps/x/main/a.zip#x",
      "https://raw.githubusercontent.com/lernapps/x/main/a.txt",
      "http://raw.githubusercontent.com/lernapps/x/main/a.zip",
      "https://example.org/lernapps/a.zip",
      "https://raw.githubusercontent.com/lernapps/",
      "https://raw.githubusercontent.com/lernapps/x/main/a b.zip",
    ]) {
      assert.equal(maintainerZipUrl(url), false, url);
    }
  });
  it("refuses another address without a download", () => {
    const result = run(issueBody(), never, { zipUrl: "https://example.org/a.zip" });
    assert.equal(result.ok, false);
    assert.deepEqual(result.problems.map((p) => p.code), ["zip-url"]);
  });
  it("is set only through env in the workflow, never in a run: step", () => {
    const workflow = readFileSync(new URL("../.github/workflows/submission.yml", import.meta.url), "utf8");
    assert.match(workflow, /zip_url:\n\s+description: [^\n]+\n\s+required: false/);
    assert.match(workflow, /zip-url: \$\{\{ inputs\.zip_url \}\}/);
    const action = readFileSync(new URL("../actions/validate/action.yml", import.meta.url), "utf8");
    assert.match(action, /ZIP_URL: \$\{\{ inputs\.zip-url \}\}/);
  });
});
