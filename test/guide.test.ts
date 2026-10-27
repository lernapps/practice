// The guidance for assistants: docs/llms.txt (the first instruction), guidance/plan-template.md (the process) and the
// skills in skills/. What they name must exist: the addresses of this repo, the commands, the skills; and the plan
// template keeps the front matter of the tooling's plans (schema: @lernapps/tooling/guidance/
// plan-front-matter.v1.schema.json), which `create` and the hooks read.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");
const RAW = "https://raw.githubusercontent.com/lernapps/practice/main/";
const TEMPLATE = "guidance/plan-template.md";
const plan = read(TEMPLATE);
const guide = read("docs/llms.txt");

/** The skills of this repo: skills/<group>/<name>/SKILL.md. */
const folders = readdirSync(join(root, "skills")).flatMap((group) =>
  readdirSync(join(root, "skills", group)).map((name) => ({ name, dir: `skills/${group}/${name}` })),
);

/** The skills the creator's folder holds, by source: exactly these and the content guide that `create` writes. */
const EXPECTED = {
  "lernapps/practice": ["lernapps-practice-explore", "lernapps-practice-photos", "lernapps-practice-submit"],
  "lernapps/tooling": [
    "lernapps-explainer",
    "lernapps-explainer-design",
    "lernapps-content-questions",
    "lernapps-exercise-patterns",
    "lernapps-content-research",
    "lernapps-check",
  ],
};
/** Skills of the tooling that do not fit a practice app: it is not published through GitHub and not listed. */
const EXCLUDED = ["lernapps-app", "lernapps-commit", "lernapps-github", "lernapps-listing", "lernapps-content-growth", "lernapps-quiz", "lernapps-quiz-design", "lernapps-interactive", "lernapps-interactive-design"];

/** The `npx skills add` commands of a text: their source and the names after -s. */
const installs = (text: string) =>
  [...text.replace(/\n\s+/g, " ").matchAll(/npx --yes skills add (\S+) -y((?: -s [a-z0-9-]+)+)/g)].map((m) => ({
    source: m[1] ?? "",
    skills: [...(m[2] ?? "").matchAll(/-s ([a-z0-9-]+)/g)].map((s) => s[1] ?? ""),
  }));

describe("docs/llms.txt", () => {
  it("is short: the first instruction only", () => {
    assert.ok(guide.split("\n").length <= 25, `${guide.split("\n").length} lines`);
    assert.ok(!/^## \d/m.test(guide), "no numbered steps of a process");
  });
  it("downloads the plan template of this repo with curl as .vibe/plans/01-<anlass>.md", () => {
    const url = `${RAW}${TEMPLATE}`;
    assert.ok(guide.includes(`curl -fsSL -o .vibe/plans/01-<anlass>.md ${url}`));
    assert.ok(existsSync(join(root, TEMPLATE)));
  });
  it("names only addresses that exist in this repo", () => {
    for (const [url] of guide.matchAll(/https:\/\/\S+/g)) {
      assert.ok(url.startsWith(RAW), url);
      assert.ok(existsSync(join(root, url.slice(RAW.length))), url);
    }
  });
  it("names the prerequisite and says to read the template in full and follow it", () => {
    assert.match(guide, /Node 22\.18/);
    assert.match(guide, /git/);
    assert.match(guide, /vollständig/);
    assert.match(guide, /Aufgabe für Aufgabe/);
  });
});

describe("the plan template", () => {
  const front = /^---\n([\s\S]*?)\n---\n/.exec(plan)?.[1] ?? "";
  const values = Object.fromEntries(
    front
      .split("\n")
      .filter((line) => !line.startsWith("#"))
      .map((line) => /^(\w+): (.*)$/.exec(line))
      .filter((m) => m !== null)
      .map((m) => [m[1], m[2]]),
  );
  it("has the front matter of the tooling's plans, one key per line, starting in Explore without an archetype", () => {
    assert.deepEqual(values, { archetype: "null", phase: "explore", prePushFailures: "0", failedChecks: "{}" });
    assert.match(front, /plan-front-matter\.v1\.schema\.json/);
  });
  it("sets the archetype explainer when Explore ends", () => {
    assert.match(plan, /Set `archetype: explainer` and `phase: plan`/);
  });
  it("has the four phases and the retrospective, in order", () => {
    const headings = [...plan.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    assert.deepEqual(headings.filter((h) => ["Explore", "Plan", "Code", "Commit", "Retrospective"].includes(h ?? "")), ["Explore", "Plan", "Code", "Commit", "Retrospective"]);
  });
  it("waits for the creator at the checkpoints: concept, plan, submit, address", () => {
    const checkpoints = plan.split("\n").filter((line) => line.includes("**Checkpoint:**"));
    assert.deepEqual(checkpoints.map((line) => /\*\*Checkpoint:\*\* (\w+)/.exec(line)?.[1]), ["concept", "confirm", "submit", "address"]);
  });
  it("installs exactly the expected skills, from lernapps/practice and lernapps/tooling", () => {
    const found = installs(plan);
    assert.deepEqual(found.map((f) => f.source), Object.keys(EXPECTED));
    for (const { source, skills } of found) assert.deepEqual(skills, EXPECTED[source as keyof typeof EXPECTED], source);
    for (const name of EXCLUDED) assert.ok(!found.some((f) => f.skills.includes(name)), name);
  });
  it("installs the skills of this repo that exist, and every one of them", () => {
    assert.deepEqual(folders.map((f) => f.name).sort(), [...EXPECTED["lernapps/practice"]].sort());
  });
  it("loads every installed skill in a phase, and the content guide in Code", () => {
    const phases = plan.split(/^## /m);
    const phase = (name: string) => phases.find((p) => p.startsWith(`${name}\n`)) ?? "";
    const flat = plan.replace(/\s+/g, " ");
    for (const skill of Object.values(EXPECTED).flat()) {
      assert.ok([`skill \`${skill}\``, `skills \`${skill}\``, `and \`${skill}\``].some((load) => flat.includes(`Load ${load}`) || flat.includes(`also ${load}`) || flat.includes(load)), skill);
    }
    assert.match(phase("Explore"), /Load skill `lernapps-content-research`/);
    assert.match(phase("Code"), /Load skill `lernapps-check`/);
    assert.match(phase("Code"), /app-content/);
    assert.match(phase("Commit"), /Load skill `lernapps-practice-submit`/);
  });
  it("creates the explainer with the tooling of main and adds the rule of a practice app to the content guide", () => {
    assert.ok(plan.includes("npx --yes github:lernapps/tooling#main create --archetype explainer"));
    assert.ok(plan.includes("Diese App wird über lernapps/practice eingereicht: eine Änderung ist\n      ein neues ZIP im Issue; kein Push, kein Listing."));
    assert.ok(plan.includes("`npm run build` and `npm run check` pass"));
  });
  it("names no day and no deadline", () => {
    assert.ok(!/\b(heute|morgen|bis wann|deadline|by when|next week|nächste Woche)\b/i.test(plan));
  });
});

describe("the skills", () => {
  for (const { name, dir } of folders) {
    const text = read(`${dir}/SKILL.md`);
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? "";
    it(`${name}: front matter with name, a description that names its phase, and the licence`, () => {
      assert.match(front, new RegExp(`^name: ${name}$`, "m"));
      assert.match(front, /^description: Use in (Explore|Code|Commit)\b.+ when .+$/m);
      assert.match(front, /^license: MIT$/m);
      assert.ok(!/^description: .*: /m.test(front), "a colon and a space in an unquoted description breaks the YAML");
    });
    it(`${name}: its first section says when to use it`, () => {
      assert.match(text, /^# .+\n\n## Wann benutzen\n/m);
    });
    it(`${name}: links each file of references/ and every link leads to a file`, () => {
      const links = [...text.matchAll(/\]\((references\/[^)#\s]+)\)/g)].map((m) => m[1] ?? "");
      for (const link of links) assert.ok(existsSync(join(root, dir, link)), link);
      const files = existsSync(join(root, dir, "references")) ? readdirSync(join(root, dir, "references")) : [];
      for (const file of files) assert.ok(links.includes(`references/${file}`), `SKILL.md links ${file}`);
    });
  }
  it("give no hint on copyright or the assistant's terms in Explore", () => {
    const explore = read("skills/process/lernapps-practice-explore/SKILL.md");
    assert.ok(!/Urheber|Nutzungsbedingungen|Anbieter dieses Assistenten/.test(explore));
    assert.match(explore, /zwei Wochen/);
  });
  it("say that the app stores nothing about the learners", () => {
    assert.match(read("skills/process/lernapps-practice-submit/SKILL.md"), /speichert nichts über die Lernenden/);
  });
});
