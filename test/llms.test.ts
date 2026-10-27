// The guide for assistants (docs/llms.txt) is made from the skills in skills/ by scripts/llms.mjs; the skills must be
// readable by a skill installer (`npx skills add lernapps/practice`).
import assert from "node:assert/strict";
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { generate, parseSkill } from "../scripts/llms.mjs";
import { tmp } from "./support.ts";

const root = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");
const folders = readdirSync(join(root, "skills")).flatMap((group) =>
  readdirSync(join(root, "skills", group)).map((name) => ({ name, dir: `skills/${group}/${name}` })),
);

describe("docs/llms.txt", () => {
  it("is the output of scripts/llms.mjs (run `npm run llms` after a change of a skill)", () => {
    assert.equal(read("docs/llms.txt"), generate(root));
  });
  it("is one document: no link to another file, no skill-only text", () => {
    const text = read("docs/llms.txt");
    assert.ok(!text.includes("references/"));
    assert.ok(!text.includes("<!--"));
    assert.ok(!text.includes("## Wann benutzen"));
    assert.ok(!/\]\((?!https:)/.test(text), "a relative link");
  });
  it("keeps the order of the seven steps", () => {
    const steps = [...read("docs/llms.txt").matchAll(/^## (\d)\. /gm)].map((m) => m[1]);
    assert.deepEqual(steps, ["1", "2", "3", "4", "5", "6", "7"]);
  });
  it("says that the app stores nothing about the child", () => {
    assert.match(read("docs/llms.txt"), /speichert nichts über das Kind/);
    assert.ok(!/im Browser/.test(read("docs/llms.txt")));
  });
});

describe("the skills", () => {
  it("are the three of the feature, grouped by what they hold", () => {
    assert.deepEqual(folders.map((f) => f.dir).sort(), [
      "skills/content/lernapps-practice-explainer",
      "skills/content/lernapps-practice-photos",
      "skills/process/lernapps-practice",
    ]);
  });
  for (const { name, dir } of folders) {
    const text = read(`${dir}/SKILL.md`);
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? "";
    it(`${name}: front matter with name, a description that starts with "Use … when", and the licence`, () => {
      assert.match(front, new RegExp(`^name: ${name}$`, "m"));
      assert.match(front, /^description: Use .+ when .+$/m);
      assert.match(front, /^license: MIT$/m);
      assert.ok(!/^description: .*: /m.test(front), "a colon and a space in an unquoted description breaks the YAML");
    });
    it(`${name}: has sections and its first section says when to use it`, () => {
      const { title, sections } = parseSkill(text);
      assert.ok(title);
      assert.ok(sections.length >= 3);
      if (name !== "lernapps-practice") assert.equal(sections[0]?.title, "Wann benutzen");
    });
    it(`${name}: links each file of references/ and every link leads to a file`, () => {
      const links = [...text.matchAll(/\]\((references\/[^)#\s]+)\)/g)].map((m) => m[1] ?? "");
      for (const link of links) assert.ok(existsSync(join(root, dir, link)), link);
      const files = existsSync(join(root, dir, "references")) ? readdirSync(join(root, dir, "references")) : [];
      for (const file of files) assert.ok(links.includes(`references/${file}`), `SKILL.md links ${file}`);
    });
  }
});

describe("generate", () => {
  it("refuses an include of a section that does not exist", () => {
    const base = tmp("llms-");
    cpSync(join(root, "skills"), join(base, "skills"), { recursive: true });
    const file = join(base, "skills/process/lernapps-practice/SKILL.md");
    writeFileSync(file, readFileSync(file, "utf8").replace("#Fotos lesen", "#Gibt es nicht"));
    assert.throws(() => generate(base), /no section "Gibt es nicht"/);
  });
});
