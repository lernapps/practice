import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { appFromTemplate, messages, noindex, noindexAll, prepare, readPin, type Fetcher } from "../actions/build/build.ts";
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

describe("the pin of the tooling and the templates", () => {
  const serve = (status: number, body: string): Fetcher & { asked: string[] } => {
    const asked: string[] = [];
    const fetcher = async (url: string) => {
      asked.push(url);
      return { ok: status === 200, status, text: async () => body };
    };
    return Object.assign(fetcher, { asked });
  };
  const manifest = (version: unknown, templates: unknown) =>
    JSON.stringify({ name: "@lernapps/tooling", version, dependencies: { "@lernapps/app-templates": templates } });
  const good = () => serve(200, manifest("0.3.1", "0.2.0"));

  it("is the latest tooling and the exact runtime it depends on, read from the registry", async () => {
    const fetcher = good();
    assert.deepEqual(await readPin(fetcher), { tooling: "0.3.1", templates: "0.2.0" });
    assert.deepEqual(fetcher.asked, ["https://registry.npmjs.org/@lernapps%2ftooling/latest"]);
  });
  it("takes a tooling version given instead of latest", async () => {
    const fetcher = good();
    await readPin(fetcher, "0.2.5");
    assert.deepEqual(fetcher.asked, ["https://registry.npmjs.org/@lernapps%2ftooling/0.2.5"]);
    await assert.rejects(readPin(good(), "latest"), /not a version/);
  });
  it("stops with a clear message when the registry does not answer, or answers no pin", async () => {
    await assert.rejects(readPin(serve(404, "")), /cannot read @lernapps\/tooling from https:\/\/registry\.npmjs\.org\/@lernapps%2ftooling\/latest \(HTTP 404\)/);
    await assert.rejects(readPin(serve(200, "not json")), /cannot read @lernapps\/tooling/);
    await assert.rejects(readPin(async () => { throw new Error("getaddrinfo ENOTFOUND"); }), /ENOTFOUND/);
    await assert.rejects(readPin(serve(200, manifest("latest", "0.2.0"))), /the version is not a version/);
    await assert.rejects(readPin(serve(200, manifest("0.3.1", "^0.2.0"))), /not an exact version/);
    await assert.rejects(readPin(serve(200, JSON.stringify({ version: "0.3.1" }))), /not an exact version/);
  });
});

describe("the app from the template of the package", () => {
  const pin = { templates: "0.2.0", tooling: "0.3.1" };
  const unpacked = () => {
    const dir = tmp();
    const explainer = join(dir, "explainer");
    mkdirSync(join(explainer, "src"), { recursive: true });
    writeFileSync(join(explainer, "_gitignore"), "node_modules/\n");
    writeFileSync(join(explainer, ".npmrc"), "install-links=true\n");
    writeFileSync(join(explainer, "README.md"), "# explainer\n");
    writeFileSync(join(explainer, "package-lock.json"), "{}");
    writeFileSync(join(explainer, "src/main.ts"), "// main\n");
    writeFileSync(
      join(explainer, "package.json"),
      JSON.stringify({
        name: "explainer",
        devDependencies: { "@lernapps/app-templates": "file:..", "@lernapps/tooling": "github:lernapps/tooling#x", vue: "3" },
        overrides: { "@lernapps/app-templates": "file:.." },
      }),
    );
    return dir;
  };
  it("is the folder explainer/ with the .gitignore back and the exact versions of the pin", () => {
    const app = join(tmp(), "app");
    appFromTemplate(unpacked(), app, pin);
    assert.equal(readFileSync(join(app, ".gitignore"), "utf8"), "node_modules/\n");
    assert.ok(!existsSync(join(app, "_gitignore")));
    for (const name of [".npmrc", "README.md", "package-lock.json"]) assert.ok(!existsSync(join(app, name)), name);
    assert.ok(existsSync(join(app, "src/main.ts")));
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
      overrides?: unknown;
    };
    assert.deepEqual(manifest.devDependencies, { "@lernapps/app-templates": "0.2.0", "@lernapps/tooling": "0.3.1", vue: "3" });
    // the template's override of the runtime with its own folder would conflict with the pin (npm EOVERRIDE)
    assert.equal(manifest.overrides, undefined);
  });
  it("stops when the package has no template explainer/", () => {
    assert.throws(() => appFromTemplate(tmp(), join(tmp(), "app"), pin), /is no template/);
  });
});
