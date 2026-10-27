// Tests of the repo itself: the workflows, the form, and that the docs name the numbers the code uses.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ALLOWED_EXTENSIONS, FORM_LABELS, GRADES, LIFETIME_DAYS, MAX_DEPTH, MAX_DOWNLOAD_BYTES, MAX_FILE_BYTES, MAX_FILES, MAX_SUBJECT_LENGTH, MAX_UNPACKED_BYTES, STATES } from "../actions/lib/limits.ts";

const root = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");
const yamls = [
  ...readdirSync(join(root, ".github/workflows")).map((f) => `.github/workflows/${f}`),
  ...readdirSync(join(root, "actions"), { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== "lib").map((d) => `actions/${d.name}/action.yml`),
];

describe("workflows and actions", () => {
  it("pin every action of others to a commit", () => {
    for (const file of yamls) {
      for (const [, uses] of read(file).matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) {
        if (uses?.startsWith("./")) continue;
        assert.match(uses ?? "", /@[0-9a-f]{40}$/, `${file}: ${uses}`);
      }
    }
  });

  it("never put an expression into a run: step (text from an issue goes through env or files)", () => {
    for (const file of yamls) {
      const lines = read(file).split("\n");
      lines.forEach((line, i) => {
        const m = /^(\s*)(?:- )?run:\s*(.*)$/.exec(line);
        if (!m) return;
        const body = [m[2] ?? ""];
        if (m[2] === "|" || m[2] === ">") {
          const indent = (m[1] ?? "").length;
          for (let j = i + 1; j < lines.length && (lines[j] === "" || (lines[j]?.search(/\S/) ?? 0) > indent); j++) body.push(lines[j] ?? "");
        }
        assert.ok(!body.join("\n").includes("${{"), `${file}:${i + 1}`);
      });
    }
  });

  it("give each job of einreichung.yml the least rights", () => {
    const text = read(".github/workflows/einreichung.yml");
    assert.match(text, /^permissions: \{\}/m);
    assert.match(text, /intake:[\s\S]*?permissions:\n\s+issues: read\n\s+contents: read\n/);
    assert.match(text, /build:[\s\S]*?permissions:\n\s+contents: read\n\s+steps:/);
    assert.match(text, /publish:[\s\S]*?permissions:\n\s+contents: write\n\s+issues: write\n\s+pages: read\n/);
    assert.ok(!/secrets\./.test(text));
  });

  it("run einreichung on issues opened and edited, and on workflow_dispatch with the input issue", () => {
    const text = read(".github/workflows/einreichung.yml");
    assert.match(text, /issues:\n\s+types: \[opened, edited\]/);
    assert.match(text, /workflow_dispatch:\n\s+inputs:\n\s+issue:\n[\s\S]*?required: true/);
  });

  it("run aufraeumen daily at a minute that is not 0, and on closed issues, with a dry run", () => {
    const text = read(".github/workflows/aufraeumen.yml");
    const cron = /cron: "(\d+) (\d+) \* \* \*"/.exec(text);
    assert.ok(cron && cron[1] !== "0");
    assert.match(text, /issues:\n\s+types: \[closed\]/);
    assert.match(text, /dry-run:/);
    assert.match(read("docs/lebensdauer.md"), new RegExp(`${String(cron?.[2]).padStart(2, "0")}:${cron?.[1]} Uhr UTC`));
  });

  it("serialise the writes to gh-pages in one group", () => {
    for (const file of [".github/workflows/einreichung.yml", ".github/workflows/aufraeumen.yml"]) {
      assert.match(read(file), /concurrency:\n\s+group: gh-pages\n\s+cancel-in-progress: false/, file);
    }
  });

  it("describe every action", () => {
    for (const file of yamls.filter((f) => f.startsWith("actions/"))) assert.match(read(file), /^description: >-\n/m, file);
  });
});

describe("the form", () => {
  const form = read(".github/ISSUE_TEMPLATE/einreichen.yml");
  it("has the fixed ids and the title", () => {
    assert.match(form, /^name: Vorbereitung einreichen$/m);
    assert.deepEqual([...form.matchAll(/^\s+id: (\w+)$/gm)].map((m) => m[1]), ["fach", "klassenstufe", "bundesland", "zip", "erklaerungen"]);
  });
  it("has the labels the intake looks for", () => {
    for (const label of FORM_LABELS) assert.ok(form.includes(`label: ${label}`), label);
  });
  it("offers the same grades and states as the code accepts", () => {
    const options = (id: string) => {
      const part = form.split(`id: ${id}`)[1]?.split("validations:")[0] ?? "";
      return [...part.matchAll(/^\s+- "?([^"\n]+?)"?$/gm)].map((m) => m[1]);
    };
    assert.deepEqual(options("klassenstufe"), GRADES);
    assert.deepEqual(options("bundesland"), STATES);
  });
  it("asks for three declarations, each required", () => {
    const part = form.split("id: erklaerungen")[1] ?? "";
    assert.equal(part.match(/required: true/g)?.length, 3);
  });
});

describe("the docs", () => {
  const rules = read("docs/regeln.md");
  it("name the limits of the code", () => {
    assert.ok(rules.includes(`höchstens ${MAX_DOWNLOAD_BYTES / 1024 / 1024} MB`));
    assert.ok(rules.includes(`höchstens ${MAX_FILES} Dateien`));
    assert.ok(rules.includes(`höchstens ${MAX_UNPACKED_BYTES / 1024 / 1024} MB zusammen`));
    assert.ok(rules.includes(`höchstens ${MAX_FILE_BYTES / 1024 / 1024} MB je Datei`));
    assert.ok(rules.includes(`höchstens ${MAX_DEPTH} Ordner tief`));
    assert.ok(rules.includes(`höchstens ${MAX_SUBJECT_LENGTH} Zeichen`));
    for (const extension of ALLOWED_EXTENSIONS) assert.ok(rules.includes(`\`.${extension}\``), extension);
  });
  it("name the lifetime", () => {
    assert.equal(LIFETIME_DAYS, 14);
    assert.match(read("docs/lebensdauer.md"), /zwei Wochen\*\* \(14 Tage\)/);
  });
  it("explain the prefill parameters of every field the URL can set", () => {
    const text = read("docs/einreichen.md");
    for (const parameter of ["template", "title", "fach", "klassenstufe", "bundesland"]) assert.ok(text.includes(`\`${parameter}\``), parameter);
  });
  it("have a llms.txt with the headings, ready for the draft", () => {
    assert.match(read("docs/llms.txt"), /^# .+\n\n[\s\S]*?\n## 1\. /); // the title, a short intro, then the numbered steps
  });
  it("name the checks of a bundle that really run", () => {
    const text = read("docs/pruefungen.md");
    for (const rule of ["accessible", "usable-at-360px", "no-tracking", "no-request-before-click", "own-data-only", "links-resolve", "pages-reachable", "explainer-readable-without-js"]) {
      assert.ok(text.includes(`\`${rule}\``), rule);
    }
  });
});

describe("the repo", () => {
  it("has the usual files of the sister repos", () => {
    for (const file of ["AGENTS.md", "CLAUDE.md", "README.md", "LICENSE", "renovate.json", ".gitignore", "package.json"]) assert.ok(read(file).length > 0, file);
    assert.equal(read("CLAUDE.md"), "@AGENTS.md\n");
    assert.match(read("AGENTS.md"), /^Reply as per ISO 24495/);
  });
  it("pins no app-templates of its own: the build reads the pin of lernapps/tooling on main", () => {
    assert.equal(JSON.parse(read("package.json")).appTemplates, undefined);
    assert.match(read("actions/build/action.yml"), /node "\$GITHUB_ACTION_PATH\/build\.ts" pin\n/);
  });
});
