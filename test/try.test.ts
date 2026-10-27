// `npm run try -- <zip>`: a ZIP file through the intake checks and the build, with the bot's comment as the output.
// The ZIP files are made here from the small fixture; the build is replaced by a fake unless TRY_REAL=1 (it then
// installs app-templates and builds for real: minutes, needs the network).
import assert from "node:assert/strict";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { messages, type BuildResult } from "../actions/build/build.ts";
import { readPin } from "../actions/build/build.ts";
import { buildAt, parseArgs, tryZip, type Builder } from "../scripts/try.ts";
import { tmp } from "./support.ts";
import { buildZip, type Spec } from "./zip-builder.ts";

const base = new URL("fixtures/minimal/", import.meta.url).pathname;
const fixture = (): Spec[] => {
  const specs: Spec[] = [{ name: "src/" }];
  for (const entry of readdirSync(join(base, "src"), { recursive: true, withFileTypes: true })) {
    const path = relative(base, join(entry.parentPath, entry.name));
    specs.push(entry.isDirectory() ? { name: `${path}/` } : { name: path, data: readFileSync(join(base, path)) });
  }
  return specs;
};
const zipFile = (specs: Spec[]) => {
  const file = join(tmp(), "test.zip");
  writeFileSync(file, buildZip(specs));
  return file;
};
const ok: BuildResult = { ok: true, stage: "done", log: "", seconds: { build: 1, check: 2 }, pages: 3 };
const fake = (result: BuildResult): Builder => () => result;
const run = (file: string, build: Builder) => {
  const said: string[] = [];
  const code = tryZip(file, (text) => said.push(text), build, tmp());
  return { code, said: said.join("\n") };
};
const real = process.env["TRY_REAL"] === "1";
const realBuild = real ? buildAt(await readPin()) : undefined;

describe("npm run try", () => {
  it("passes a small valid ZIP file and says what the bot says about a preview", () => {
    const { code, said } = run(zipFile(fixture()), realBuild ?? fake(ok));
    assert.equal(code, 0);
    assert.match(said, /Vorschau/);
    assert.match(said, /Prüfung ohne Befund/);
  });

  it("reports a broken ZIP file as the bot does, before it builds anything", () => {
    let built = false;
    const { code, said } = run(zipFile([...fixture(), { name: "src/kapitel/skript.js", data: "alert(1)" }]), () => ((built = true), ok));
    assert.equal(code, 1);
    assert.match(said, /Wir konnten Deine Vorbereitung noch nicht veröffentlichen/);
    assert.equal(built, false);
  });

  it("reports a failed build with the messages in a text block", () => {
    const log = messages("RolldownError: the explainer's content in src/ is not valid:\n  - src/kapitel/seite.yaml:3: not valid YAML: Nested mappings are not allowed\n    at x (y)", "");
    const { code, said } = run(zipFile(fixture()), fake({ ok: false, stage: "build", log, seconds: { build: 1, check: 0 } }));
    assert.equal(code, 1);
    assert.match(said, /Beim Bauen sind Fehler aufgetreten/);
    assert.match(said, /```text\n[\s\S]*src\/kapitel\/seite\.yaml:3: not valid YAML/);
    assert.ok(!said.includes("    at x"));
  });

  it("reports a build that a real YAML error stops", { skip: !real }, () => {
    const specs = fixture().map((s) => (s.name.endsWith("seite.yaml") ? { ...s, data: `${String(s.data)}\nkaputt: ein: zwei\n` } : s));
    const { code, said } = run(zipFile(specs), realBuild!);
    assert.equal(code, 1);
    assert.match(said, /not valid YAML/);
  });
});

describe("the arguments of npm run try", () => {
  it("are the ZIP file and, optionally, a commit of app-templates", () => {
    assert.deepEqual(parseArgs(["a.zip"]), { zip: "a.zip" });
    assert.deepEqual(parseArgs(["a.zip", "--commit", "abc"]), { zip: "a.zip", commit: "abc" });
    assert.deepEqual(parseArgs(["--commit", "abc", "a.zip"]), { zip: "a.zip", commit: "abc" });
    assert.deepEqual(parseArgs([]), {});
  });
});
