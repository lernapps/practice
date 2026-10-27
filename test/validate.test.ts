import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { curlDownload, intake, type Download } from "../actions/validate/validate.ts";
import { buildZip, goodSpecs } from "./zip-builder.ts";
import { issueBody, tmp } from "./support.ts";

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
    assert.equal(result.zip?.files, 4);
    assert.ok(existsSync(join(outDir, "tree/src/app.yaml")));
    const meta = JSON.parse(readFileSync(join(outDir, "meta.json"), "utf8"));
    assert.deepEqual(meta, { issue: 7, fach: "Religion", klassenstufe: "7", bundesland: "Hessen", erstellt: "2026-10-27T10:00:00.000Z" });
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
    assert.deepEqual(result.problems.map((p) => p.code).sort(), ["erklaerungen", "fach-missing", "klassenstufe"]);
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

describe("the download", () => {
  it("loads only the attachment addresses, before it starts curl", () => {
    for (const bad of ["http://github.com/user-attachments/files/1/a.zip", "https://example.com/a.zip", "file:///etc/passwd", "https://github.com/user-attachments/files/1/a.zip?x=1", "-o/etc/x", "https://github.com/user-attachments/files/1/a.zip\nx"]) {
      assert.equal(curlDownload(bad).problem?.code, "zip-url", bad);
    }
  });
});
