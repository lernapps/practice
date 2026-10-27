---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype, null until Explore ends; then explainer, the only archetype of lernapps practice. Never another value.
archetype: null
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: explore
# prePushFailures: written by the pre-push hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: {}
---

# Plan: <occasion>, a learning app through lernapps practice

<!--
For you, the assistant. lernapps practice: the creator has an occasion (a class test, a cover lesson, …) and no app
of the catalog fits. You make a small explainer for it on this computer; the creator submits its src/ as a ZIP file
in an issue of lernapps/practice, and GitHub serves it for two weeks at https://lernapps.net/practice/i/<number>/.
1. Path: `.vibe/plans/01-<occasion>.md`, in a new, empty folder. A correction after the submission is no new plan:
   it is a task of Commit.
2. Read this plan before each step. One phase at a time, tasks in order.
3. Task done → tick `[x]` at once and move it to "Completed" of its phase. An unticked box counts as not done.
4. New task found → add it.
5. Each phase names its skills. Load a skill when its task comes, not before. Read it in full, from its file.
6. Checkpoint: stop, ask, wait for the creator's answer. A message sent before the question is no yes.
   Only a checkpoint waits. A phase's last box → set the next phase and go on in the same message.
7. At most 2 questions per message, one topic each. No questions inside drafts or lists.
8. Work locally, in this folder. Push nothing, create no repository, list nothing: the submission is the ZIP file.
9. Plan in the creator's language. Keep headings and front matter keys. Delete a comment once its part is filled.
10. Begin each reply to the creator with the phase in `phase:`, and at a checkpoint the word checkpoint:
    "**Explore · Checkpoint**", "**Code**". The creator always knows where you are.
11. You need a shell with Node 22.18 or newer, git and the network (github.com, raw.githubusercontent.com,
    codeload.github.com, registry.npmjs.org). Blocked → ask the creator to allow it, then run again.
-->

*Explore, Plan, Code, Commit.*

## Goal

<!-- 1–2 sentences: the occasion, who learns, what they can do afterwards. -->

## Key decisions

<!-- One line each: decision and reason. Archetype explainer first (lernapps practice). Scope and weighting from
the occasion. Your own choice without the creator: mark "(guess)". -->

## Notes

<!-- Occasion, subject, school year, Land; the topics from the material; facts to check and their sources; scope;
open questions. Never the material itself, never a name. -->

## Explore

<!--
- Find out the occasion, whether an app exists, what the material holds and what the app should do. All content
  questions belong here.
- Ask. Write no code, run no `create`.
- An answer counts only in the creator's words under "Answers". Never tick a topic you assumed.
- Skills: `lernapps-practice-explore`, `lernapps-practice-photos`, `lernapps-content-research`,
  `lernapps-exercise-patterns`, `lernapps-explainer-design`.
-->

### Tasks

- [ ] Install the skills, if missing, in this folder: from lernapps/practice
      `npx --yes skills add lernapps/practice -y -s lernapps-practice-explore -s lernapps-practice-photos -s lernapps-practice-submit`,
      from lernapps/tooling
      `npx --yes skills add lernapps/tooling -y -s lernapps-explainer -s lernapps-explainer-design -s lernapps-content-questions -s lernapps-exercise-patterns -s lernapps-content-research -s lernapps-check`.
      No other skill: this app is not published through GitHub and not listed.
- [ ] Load skill `lernapps-practice-explore`. Ask the occasion first, as it says.
- [ ] Search the catalog as the skill says. An app fits → give the creator its link and ask whether it is enough;
      yes → the plan ends here.
- [ ] Tell the creator what the skill says before the material: public for two weeks, no names, school or
      handwriting in the app.
- [ ] Load skill `lernapps-practice-photos`. Read the material as it says. Under "Notes": the topics, page by page;
      each figure of the material and how you redraw it.
- [ ] Load skill `lernapps-content-research`. Every fact you are not sure of (numbers, dates, names, ways of
      counting): a source you opened, under "Notes". No source → mark it for the creator to check.
- [ ] Load skills `lernapps-exercise-patterns` and `lernapps-explainer-design`. Draft the concept as skill
      `lernapps-practice-explore` says: scope and weighting for the occasion, pages, exercises, figures.
- [ ] **Checkpoint:** concept. Show in plain words: occasion, topics, scope and weighting, what learners do on each
      page, which figures you redraw, every "(guess)", the facts the creator should check. Stop and wait. Changes →
      change, ask again.
- [ ] Set `archetype: explainer` and `phase: plan`: change the value lines (`grep -E '^(archetype|phase):'` prints
      `archetype: explainer` and `phase: plan`).

### Answers

<!-- The creator's answers, in their words. Keep the topics. -->

- Occasion: what is coming (a class test, a cover lesson, the state of a class, missed work), for whom.
- Learners: subject, school year, Land; for religion the denomination.
- Material: what the creator gives (photos of worksheets, book pages, a self-test) and what of it counts.
- Weighting: what matters most for the occasion (all topics evenly, the weak ones, a quick overview).
- Look and feel: calm like a worksheet; figures that help.

### Completed

## Plan

<!--
- Map the confirmed concept onto the explainer: chapters, pages, blocks, exercises, figures, components.
- No new content questions. A content gap → back to Explore; say so.
- Confirmable in one read. After the yes, work on your own until Commit.
- Skills: `lernapps-explainer-design`, `lernapps-exercise-patterns` and `lernapps-content-research`, loaded in
  Explore; reread them if they are no longer in view.
-->

### Tasks

- [ ] `grep '^phase:'` prints `phase: plan`; else set it.
- [ ] Map the content as skill `lernapps-explainer-design` says: chapters and pages, with the pages skill
      `lernapps-practice-explore` names for the occasion.
- [ ] Choose a pattern per topic as skill `lernapps-exercise-patterns` says. Write "Content method".
- [ ] Each figure: what it shows, its labels as in the material, how you make it (generated image or SVG drawing,
      as skill `lernapps-practice-photos` says). Each component: what it shows and checks, and why no block fits.
- [ ] The facts to check: each with its source (skill `lernapps-content-research`), or marked for the creator.
- [ ] Write the Code tasks under "Code": one per page or component, with its content and exercises.
- [ ] **Checkpoint:** confirm the plan. Show it short: pages, exercises, figures, components, the facts to check;
      what learners see and do. Stop and wait for an explicit yes. Changes → change, ask again. No `create` before
      the yes.
- [ ] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

<!-- One line each: exercise patterns and where; figures and how they are made; data files; each component, what it
checks and cannot. Becomes the content guide in Code. -->

### Completed

## Code

<!--
- Build the app from the explainer and the confirmed plan, in this folder. Work on your own.
- A check fails → skill `lernapps-check`. Fix from the message; never bypass a check.
- Undecidable → choose, mark "(guess)" under "Key decisions", go on.
- Creator asks for a change → first say your reading in one sentence; never narrow it silently.
- Skills: `lernapps-check`, `lernapps-explainer`, `lernapps-content-questions`, `lernapps-practice-photos` (the
  figures), and the app's content guide `app-content`.
-->

### Tasks

- [ ] `grep '^phase:'` prints `phase: code`; else set it.
- [ ] Load skill `lernapps-check`. Create the app in this folder as it says, with
      `npx --yes github:lernapps/tooling#main create --archetype explainer`; then `git init`, `npm install`, the
      first commit. `create` keeps this plan and the skills. Never write the app by hand.
- [ ] Fill the content guide `.agents/skills/app-content/SKILL.md` from "Notes" and "Content method". Add under
      "Rules learned from mistakes" the line: "Diese App wird über lernapps/practice eingereicht: eine Änderung ist
      ein neues ZIP im Issue; kein Push, kein Listing." `grep -c "FILL IN" .agents/skills/app-content/SKILL.md`
      prints 0.
- [ ] Load skill `lernapps-explainer` and the content guide. Questions with options and feedback: also skill
      `lernapps-content-questions`.
- [ ] Replace the example chapter "Prozent" and the example component `ProzentFeld` with the planned content.
- [ ] <the tasks written in Plan; each: write it in `src/`, then `npm run build`>
- [ ] The figures: as skill `lernapps-practice-photos` says, in `src/images/`, with `source` and `licence`.
- [ ] `npm run build` and `npm run check` pass.
- [ ] The content guide matches what was built.
- [ ] Every box of Explore, Plan and Code ticked.
- [ ] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).
      No checkpoint here: set it before you ask or report anything, then start Commit in the same message.

### Completed

## Commit

<!--
- Hand the app over: the creator submits the ZIP file of `src/` through the form of lernapps/practice. GitHub checks
  it, builds it and comments the address.
- Skill: `lernapps-practice-submit`.
-->

### Tasks

- [ ] `grep '^phase:'` prints `phase: commit`; else set it.
- [ ] Load skill `lernapps-practice-submit`. Make the ZIP file of `src/` as it says.
- [ ] **Checkpoint:** submit. Give the creator the ZIP file and the link to the form as the skill says; wait for the
      bot's comment.
- [ ] The comment names problems → correct them in `src/`, `npm run build` and `npm run check`, a new ZIP file; the
      creator replaces it in the issue. Repeat until the comment gives the address.
- [ ] **Checkpoint:** address. The comment gives the address: open it, confirm the app shows, give the creator the
      address and what the skill says about two weeks and the 👍.
- [ ] Fill the retrospective.

### Completed

## Retrospective

<!-- At the end of Commit. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; submitted, address received". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
