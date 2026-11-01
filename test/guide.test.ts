// The guidance for assistants: docs/llms.txt (the first instruction), guidance/plan-template.md (the process) and the
// skills in skills/. What they name must exist: the commands, the skills; and the plan template keeps the front
// matter of the tooling's plans (schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json), which `create`
// and the hooks read. Nothing is downloaded: `npx --yes @lernapps/practice init` writes the template and the skills.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");
const TEMPLATE = "guidance/plan-template.md";
const plan = read(TEMPLATE);
const guide = read("docs/llms.txt");

/** The skills of this repo: skills/<group>/<name>/SKILL.md. */
const folders = readdirSync(join(root, "skills")).flatMap((group) =>
  readdirSync(join(root, "skills", group)).map((name) => ({ name, dir: `skills/${group}/${name}` })),
);

/** The skills of this package, which init syncs with those of the tooling. */
const PRACTICE = ["lernapps-practice-explore", "lernapps-practice-plan", "lernapps-practice-photos", "lernapps-practice-submit"];
/** The skills of the tooling the plan loads: init syncs all but the archetype's, which `lernapps skills` adds. */
const TOOLING = ["lernapps-content-questions", "lernapps-exercise-patterns", "lernapps-content-research", "lernapps-cli"];
const ARCHETYPE = ["lernapps-explainer", "lernapps-explainer-design"];

describe("docs/llms.txt", () => {
  it("is short: the first instruction only", () => {
    assert.ok(guide.split("\n").length <= 25, `${guide.split("\n").length} lines`);
    assert.ok(!/^## \d/m.test(guide), "no numbered steps of a process");
  });
  it("starts the app with `npx --yes @lernapps/practice init <anlass>`, which writes the plan template", () => {
    assert.ok(guide.includes("npx --yes @lernapps/practice init <anlass>"));
    assert.ok(guide.includes(".vibe/plans/01-<anlass>.md"));
    assert.ok(existsSync(join(root, TEMPLATE)));
  });
  it("downloads nothing: no address, no curl", () => {
    assert.ok(!/https?:\/\//.test(guide.replace(/^>.*$/m, "")), "an address in the instruction");
    assert.ok(!/curl/.test(guide));
  });
  it("names the prerequisite and says to read the template in full and follow it", () => {
    assert.match(guide, /Node 22\.18/);
    assert.match(guide, /git/);
    assert.match(guide, /npm-Registry/);
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
  it("waits for the creator at the checkpoints: proposal, pages, submit, address", () => {
    const checkpoints = plan.split("\n").filter((line) => line.includes("**Checkpoint:**"));
    assert.deepEqual(checkpoints.map((line) => /\*\*Checkpoint:\*\* (\w+)/.exec(line)?.[1]), ["proposal", "pages", "submit", "address"]);
  });
  it("installs nothing from GitHub: no skills add, no github:, no download", () => {
    assert.ok(!/skills add|github:lernapps|raw\.githubusercontent|curl/.test(plan));
  });
  it("names the skills of the phases, which init put in the folder, and installs the archetype's after the choice", () => {
    assert.match(plan, /`npx --yes @lernapps\/practice init <short name>`/);
    const phases = plan.split(/^## /m);
    const phase = (name: string) => phases.find((p) => p.startsWith(`${name}\n`)) ?? "";
    assert.ok(phase("Explore").includes("lernapps-practice-explore` missing"), "Explore says what a missing skill means");
    // the archetype's skills come with `lernapps skills --archetype explainer`, at the start of Plan, before one is loaded
    const install = plan.indexOf("npx --no -- lernapps skills --archetype explainer");
    assert.ok(install > plan.indexOf("## Plan"), "in Plan");
    assert.ok(install < plan.indexOf("Load skills `lernapps-practice-plan`"), "before its skills are loaded");
  });
  it("is made of the skills of this package", () => {
    assert.deepEqual(folders.map((f) => f.name).sort(), [...PRACTICE].sort());
  });
  it("loads every skill it needs in a phase, and the content guide in Code", () => {
    const phases = plan.split(/^## /m);
    const phase = (name: string) => phases.find((p) => p.startsWith(`${name}\n`)) ?? "";
    const flat = plan.replace(/\s+/g, " ");
    for (const skill of [...PRACTICE, ...TOOLING, ...ARCHETYPE]) assert.ok(flat.includes(`\`${skill}\``), skill);
    assert.match(phase("Explore"), /Load skill `lernapps-practice-explore`/);
    assert.match(phase("Code"), /Load skill `lernapps-cli`/);
    assert.match(phase("Code"), /app-content/);
    assert.match(phase("Commit"), /Load skill `lernapps-practice-submit`/);
  });
  it("creates the explainer with the tooling's create and adds the rule of a practice app to the content guide", () => {
    assert.ok(plan.includes("npx --no -- lernapps create --archetype explainer"));
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
      assert.match(front, /^description: Use in (Explore|Plan|Code|Commit)\b.+ when .+$/m);
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
