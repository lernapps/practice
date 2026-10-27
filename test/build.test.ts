import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { messages, noindex, noindexAll, prepare } from "../actions/build/build.ts";
import { tmp } from "./support.ts";

const page = (head = "") => `<!doctype html>\n<html lang="de">\n  <head>\n    <meta charset="utf-8">${head}\n  </head>\n  <body></body>\n</html>\n`;

describe("noindex", () => {
  it("is added to the head", () => {
    assert.match(noindex(page()), /<meta name="robots" content="noindex">\n  <\/head>/);
  });
  it("replaces another robots tag", () => {
    const html = noindex(page('<meta name="robots" content="index,follow">'));
    assert.ok(!html.includes("index,follow"));
    assert.equal(html.match(/name="robots"/g)?.length, 1);
  });
  it("stops on a page it cannot mark", () => {
    assert.throws(() => noindex("<html><body>x</body></html>"));
  });
  it("marks every page of a folder, nested too, and nothing else", () => {
    const dir = tmp();
    mkdirSync(join(dir, "a/b"), { recursive: true });
    writeFileSync(join(dir, "index.html"), page());
    writeFileSync(join(dir, "a/b/index.html"), page());
    writeFileSync(join(dir, "a/x.js"), "x");
    assert.equal(noindexAll(dir), 2);
    assert.ok(readFileSync(join(dir, "a/b/index.html"), "utf8").includes('content="noindex"'));
    assert.equal(readFileSync(join(dir, "a/x.js"), "utf8"), "x");
  });
});

describe("messages of a failed build", () => {
  const log = [
    "\u001b[31m✗ Build failed\u001b[39m",
    "RolldownError: the explainer's content in src/ is not valid:",
    "  - src/bibel/a.yaml:70: not valid YAML: Nested mappings are not allowed",
    "    at error (file:///work/node_modules/x.mjs:166:24)",
    "    at async Object.build (file:///work/node_modules/y.mjs:1:1)",
    "  errors: [Getter/Setter]",
    "}",
    "npm error code 1",
  ].join("\n");
  it("keeps the file, line and rule, and drops stack frames, colours and npm's tail", () => {
    const text = messages(log, "/work");
    assert.match(text, /src\/bibel\/a\.yaml:70: not valid YAML/);
    assert.ok(!text.includes("    at "));
    assert.ok(!text.includes("\u001b"));
    assert.ok(!text.includes("npm error"));
    assert.ok(!text.includes("Getter"));
  });
  it("cuts the runner's folder from paths", () => {
    assert.ok(!messages("see /work/explainer/src/a.yaml", "/work/explainer").includes("/work/explainer"));
  });
  it("is at most 60 lines (59 and the note), and says how many it left out", () => {
    const text = messages(Array.from({ length: 200 }, (_, i) => `line ${i}`).join("\n"));
    assert.equal(text.split("\n").length, 60);
    assert.match(text, /141 weitere Zeilen/);
  });
});

describe("prepare", () => {
  const template = () => {
    const src = join(tmp(), "src");
    mkdirSync(join(src, "components"), { recursive: true });
    mkdirSync(join(src, "prozent"), { recursive: true });
    writeFileSync(join(src, "main.ts"), "// template");
    writeFileSync(join(src, "app.yaml"), "title: example");
    writeFileSync(join(src, "components/X.vue"), "<template/>");
    writeFileSync(join(src, "prozent/a.yaml"), "x");
    return src;
  };
  const tree = (files: Record<string, string>) => {
    const dir = tmp();
    for (const [name, data] of Object.entries(files)) {
      mkdirSync(join(dir, name, ".."), { recursive: true });
      writeFileSync(join(dir, name), data);
    }
    return dir;
  };
  it("replaces the example with the submission and keeps main.ts", () => {
    const src = template();
    prepare(tree({ "src/app.yaml": "title: mine", "src/k/c.yaml": "y" }), src);
    assert.equal(readFileSync(join(src, "main.ts"), "utf8"), "// template");
    assert.equal(readFileSync(join(src, "app.yaml"), "utf8"), "title: mine");
    assert.ok(!existsSync(join(src, "components")));
    assert.ok(!existsSync(join(src, "prozent")));
    assert.ok(existsSync(join(src, "k/c.yaml")));
  });
  it("checks the tree again: a link, a script, a main.ts", () => {
    assert.throws(() => prepare(tree({ "src/app.yaml": "x", "src/a.js": "x" }), template()), /not valid/);
    assert.throws(() => prepare(tree({ "src/app.yaml": "x", "src/main.ts": "x" }), template()), /not valid/);
    const linked = tree({ "src/app.yaml": "x" });
    symlinkSync("/etc/passwd", join(linked, "src/l.yaml"));
    assert.throws(() => prepare(linked, template()), /link/);
  });
});
