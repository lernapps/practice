# Testing the guide

For people who maintain the repo. The guide for assistants leads an assistant without prior knowledge to the address of the app. This page says how to test that when you change the plan template or the skills.

## What the guide is made of {#source}

| Part | Content |
| --- | --- |
| [llms.txt](llms.txt) | The entry: create a folder, download the plan template, follow it. |
| `guidance/plan-template.md` | The plan template with the phases of the tooling: Explore, Plan, Code, Commit. It installs the skills, names the skills of each phase and says at which checkpoints the assistant waits for the creator (concept, plan, submission, address). |
| `lernapps-practice-explore` | Explore: occasion, catalogue, notes, concept with scope and weighting. |
| `lernapps-practice-photos` | Explore and Code: reading photos, rebuilding figures with the same content. |
| `lernapps-practice-submit` | Commit: the ZIP file of `src/`, the form, answers and corrections. |

In Plan and Code the assistant uses the content skills of the tooling (`lernapps-explainer`, `lernapps-explainer-design`, `lernapps-content-questions`, `lernapps-exercise-patterns`, `lernapps-content-research`, `lernapps-check`). A test checks that the plan template installs exactly these skills and that the addresses of `llms.txt` are right.

## How to test {#method}

1. **A fresh session.** Open an assistant that knows nothing about this repo and has no project files. Give it only the sentence from the [start page](index.md#assistant) and the material.
2. **Real material.** Use photos of real school material (worksheets, book pages). A description of the photos tests only the writing, not the reading of the images.
3. **Do not help.** Answer like a parent. Tell the assistant nothing the guide does not say.
4. **Build the result.** The assistant already builds and checks the app itself (`npm run build`, `npm run check`). Save the ZIP and build it locally the way GitHub would:

   ```text
   npm ci
   npm run try -- result.zip
   ```

   The command checks the ZIP with the rules of the submission, builds it with the template at the state the tooling pins on `main` (`appTemplates.commit`; another one with `--commit <sha>`) and checks the bundle with `lernapps check`. It prints the messages the way the bot comments them on the issue. The first run fetches the template into `_templates/` and takes a few minutes; later runs are faster. The built bundle is in `_out/site`.
5. **The error cycle.** Give the messages unchanged to the assistant, let it correct the ZIP and build again. Count the runs and the messages per run.
6. **Learn from the errors.** Every message the assistant could not solve alone belongs as a stumbling block in the skill of its phase: in practice's when it is about the submission, else as a note to the tooling. Then a new test.

## The danger {#danger}

- **A description instead of photos.** A test with a description of the photos says nothing about whether the assistant reads photos correctly: order, margins, handwriting, boxes. State in the table below what a test did not check.
- **Never put material in the repo.** Photos, transcripts, descriptions of the material and text from it belong in no commit, issue or pull request. The material is protected by copyright, and a child's handwriting is personal data. The ZIP files of a test also stay outside the repo (the folders `_intake/` and `_out/` are ignored).
- **Facts not checked.** The test shows that the ZIP builds, not that the facts are right. The assistant must say what the parents should check.

## Results {#results}

| Test | Who | Input | Build | `lernapps check` | Limit |
| --- | --- | --- | --- | --- | --- |
| 1 | An agent with background knowledge of the repo | Photos | 3 runs: 12 messages, 2 messages, none | no finding (8 rules) | The background knowledge helped; the guide was not alone. The stumbling blocks came from the messages. |
| 2 | A fresh session, only the guide | A description of the photos | 1 run, no message | no finding | Reading the images was not part of the test. |

Both tests were of the earlier guide for a chat without a shell. Open: a test of a fresh session with a shell, the plan template and photos, and a run on GitHub with the bot instead of `npm run try`.
