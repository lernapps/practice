#!/usr/bin/env node
// Writes docs/llms.txt, the guide for assistants, from the three skills in skills/. The guide is one document: an
// assistant loads one file and needs no other. The skill lernapps-practice holds the order of the steps; its steps 2, 3
// and 5 name the sections of the other two skills, which this script copies in. Nothing is kept twice.
//
//   node scripts/llms.mjs            write docs/llms.txt
//   node scripts/llms.mjs --stdout   print it
//
// Marks in the skills (an HTML comment on the first line below a heading):
//   <!-- skill-only -->                    the section is for the installed skill, not for llms.txt
//   <!-- no-heading -->                    the section's text stands without its heading
//   <!-- include: <skill> -->              replaces the section's text by all sections of <skill> (one level deeper)
//   <!-- include: <skill>#<Section> -->    replaces the section's text by the text of that section
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAIN = "lernapps-practice";

/** The file of a skill: skills/<group>/<name>/SKILL.md. */
function skillFile(name, base) {
  for (const group of readdirSync(join(base, "skills"))) {
    const file = join(base, "skills", group, name, "SKILL.md");
    try {
      readFileSync(file);
      return file;
    } catch {
      // not in this group
    }
  }
  throw new Error(`skill ${name} not found below skills/`);
}

/** A skill as { title, sections: [{ title, mark, body, level2 }] }; headings inside code blocks do not count. */
export function parseSkill(text) {
  const lines = text.replace(/^---\n[\s\S]*?\n---\n/, "").split("\n");
  let title;
  const sections = [];
  let fence = false;
  for (const line of lines) {
    if (/^```/.test(line)) fence = !fence;
    const h1 = !fence && /^# (.+)$/.exec(line);
    const h2 = !fence && /^## (.+)$/.exec(line);
    if (h1 && title === undefined) title = h1[1];
    else if (h2) sections.push({ title: h2[1], body: [] });
    else if (sections.length > 0) sections[sections.length - 1].body.push(line);
  }
  for (const section of sections) {
    const text = section.body.join("\n").trim();
    const mark = /^<!-- ([^>]+?) -->\n?/.exec(text);
    section.mark = mark?.[1];
    section.text = (mark ? text.slice(mark[0].length) : text).trim();
  }
  return { title, sections };
}

export function generate(base = root) {
  const load = (name) => parseSkill(readFileSync(skillFile(name, base), "utf8"));
  const main = load(MAIN);
  const out = [`# ${main.title}`];
  for (const section of main.sections) {
    if (section.mark === "skill-only") continue;
    const heading = section.mark === "no-heading" ? [] : [`## ${section.title}`];
    const include = /^include: ([a-z0-9-]+)(?:#(.+))?$/.exec(section.mark ?? "");
    if (!include) {
      out.push([...heading, section.text].join("\n\n"));
      continue;
    }
    const [, name, wanted] = include;
    const other = load(name);
    if (wanted !== undefined) {
      const found = other.sections.find((s) => s.title === wanted);
      if (!found) throw new Error(`${name} has no section "${wanted}"`);
      out.push([...heading, found.text].join("\n\n"));
    } else {
      const parts = other.sections.filter((s) => s.mark !== "skill-only").map((s) => `### ${s.title}\n\n${s.text}`);
      out.push([...heading, ...parts].join("\n\n"));
    }
  }
  return `${out.join("\n\n")}\n`;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = generate();
  if (process.argv.includes("--stdout")) process.stdout.write(text);
  else {
    writeFileSync(join(root, "docs/llms.txt"), text);
    console.log(`wrote docs/llms.txt (${text.length} characters)`);
  }
}
