import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { installedTooling, messages, noindex, noindexAll, prepare, readPin, useTooling, type Fetcher } from "../actions/build/build.ts";
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

describe("prepare with components and images", () => {
  const files = (entries: Record<string, string>) => {
    const dir = tmp();
    for (const [name, data] of Object.entries(entries)) {
      mkdirSync(join(dir, name, ".."), { recursive: true });
      writeFileSync(join(dir, name), data);
    }
    return dir;
  };
  const template = () => {
    const src = join(tmp(), "src");
    mkdirSync(join(src, "components"), { recursive: true });
    writeFileSync(join(src, "main.ts"), "// template");
    writeFileSync(join(src, "components/ProzentFeld.vue"), "<template/>");
    return src;
  };
  it("takes the submitted components and drawings instead of the template's example", () => {
    const src = template();
    prepare(files({ "src/app.yaml": "x", "src/components/Zahl.vue": "<template/>", "src/components/Zahl.test.ts": "t", "src/images/kreis.svg": "<svg/>", "src/data/werte.yaml": "- a: 1" }), src);
    assert.ok(existsSync(join(src, "components/Zahl.vue")));
    assert.ok(!existsSync(join(src, "components/ProzentFeld.vue")));
    assert.ok(existsSync(join(src, "images/kreis.svg")));
    assert.ok(existsSync(join(src, "data/werte.yaml")));
  });
  it("checks the drawings again", () => {
    assert.throws(() => prepare(files({ "src/app.yaml": "x", "src/images/a.svg": "<svg onload=x>" }), template()), /svg-event/);
  });
});

describe("the pin of app-templates", () => {
  const COMMIT = "a0d58d8922872083b30344a11ce055182f13d370";
  const MAIN = "44d82e538b0f7a72f9af1fbb997e4270352fa32e";
  const main = () => MAIN;
  const serve = (status: number, body: string): Fetcher & { asked: string[] } => {
    const asked: string[] = [];
    const fetcher = async (url: string) => {
      asked.push(url);
      return { ok: status === 200, status, text: async () => body };
    };
    return Object.assign(fetcher, { asked });
  };
  const manifest = (appTemplates: unknown) => JSON.stringify({ name: "@lernapps/tooling", appTemplates });
  const good = () => serve(200, manifest({ repository: "https://github.com/lernapps/app-templates.git", commit: COMMIT }));

  it("is read from the package.json of lernapps/tooling at the commit main is at, which is also the tooling to check with", async () => {
    const fetcher = good();
    assert.deepEqual(await readPin(fetcher, undefined, main), {
      repository: "lernapps/app-templates",
      commit: COMMIT,
      url: "https://github.com/lernapps/app-templates.git",
      tooling: MAIN,
    });
    assert.deepEqual(fetcher.asked, [`https://raw.githubusercontent.com/lernapps/tooling/${MAIN}/package.json`]);
  });
  it("takes a commit of app-templates given instead of the one read, and keeps the tooling of main", async () => {
    const other = "1".repeat(40);
    const pin = await readPin(good(), other, main);
    assert.equal(pin.commit, other);
    assert.equal(pin.tooling, MAIN);
    await assert.rejects(readPin(serve(200, "{}"), "main", main), /not a commit/);
  });
  it("stops with a clear message when main cannot be found", async () => {
    await assert.rejects(readPin(good(), undefined, () => { throw new Error("could not resolve host"); }), /cannot find the commit of main of lernapps\/tooling \(could not resolve host\)/);
    await assert.rejects(readPin(good(), undefined, () => "main"), /cannot find the commit of main/);
  });
  it("stops with a clear message when the address does not answer, or answers no pin", async () => {
    await assert.rejects(readPin(serve(404, ""), undefined, main), new RegExp(`cannot read the pin of app-templates from https://raw\\.githubusercontent\\.com/lernapps/tooling/${MAIN}/package\\.json \\(HTTP 404\\)`));
    await assert.rejects(readPin(serve(200, "not json"), undefined, main), /cannot read the pin/);
    await assert.rejects(readPin(async () => { throw new Error("getaddrinfo ENOTFOUND"); }, undefined, main), /ENOTFOUND/);
    await assert.rejects(readPin(serve(200, manifest({ repository: "https://github.com/lernapps/app-templates.git", commit: "main" })), undefined, main), /appTemplates\.commit is not a commit/);
    await assert.rejects(readPin(serve(200, manifest({ repository: "https://evil.example/app-templates.git", commit: COMMIT })), undefined, main), /not a repository of lernapps/);
    await assert.rejects(readPin(serve(200, manifest(undefined)), undefined, main), /appTemplates\.repository/);
  });
});

describe("the tooling of the build", () => {
  const MAIN = "44d82e538b0f7a72f9af1fbb997e4270352fa32e";
  const app = (resolved?: string) => {
    const dir = tmp();
    if (resolved !== undefined) {
      mkdirSync(join(dir, "node_modules"), { recursive: true });
      writeFileSync(join(dir, "node_modules/.package-lock.json"), JSON.stringify({ packages: { "node_modules/@lernapps/tooling": { resolved } } }));
    }
    return dir;
  };
  it("is installed at the commit of main the pin was read at, as create gives it to an app", () => {
    const calls: string[][] = [];
    const installed = useTooling(app("git+ssh://git@github.com/lernapps/tooling.git#73b90426ed503aa73e9e4f5f909724fd137b121c"), MAIN, (args) => (calls.push(args), { status: 0, output: "", seconds: 1 }));
    assert.equal(installed, true);
    assert.deepEqual(calls, [["install", "--no-audit", "--no-fund", "--save-dev", `@lernapps/tooling@github:lernapps/tooling#${MAIN}`]]);
  });
  it("is left alone when it is at that commit already", () => {
    const dir = app(`git+ssh://git@github.com/lernapps/tooling.git#${MAIN}`);
    assert.equal(installedTooling(dir), MAIN);
    assert.equal(useTooling(dir, MAIN, () => { throw new Error("must not install"); }), false);
  });
  it("stops when the install fails or the commit is not one", () => {
    assert.throws(() => useTooling(app(), MAIN, () => ({ status: 1, output: "npm error 404", seconds: 1 })), /npm install of @lernapps\/tooling/);
    assert.throws(() => useTooling(app(), "main"), /not a commit/);
  });
});
