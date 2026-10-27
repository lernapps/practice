# Testing the guide

For people who maintain the repo. The guide for assistants ([llms.txt](llms.txt)) is tested: a fresh assistant session built, with it alone, a ZIP file that built at the first attempt. This page says how to repeat that when you change the skills.

## What the guide is made of {#quelle}

The guide has one source: three skills in the folder `skills/`.

| Skill | Content |
| --- | --- |
| `lernapps-practice` | The flow from the first question to the submission, in seven steps. At steps 1, 4 and 7 the assistant waits for the parents. |
| `lernapps-practice-photos` | Notes for the parents before the photos, reading the photos. |
| `lernapps-practice-explainer` | Writing the content of an explainer, with `references/` for the table of blocks and the messages of the build. |

`npm run llms` assembles `docs/llms.txt` from them, as one document. A test checks that the checked-in file equals the result. So after every change to a skill, run `npm run llms` and commit both files together.

## How to test {#methode}

1. **A fresh session.** Open an assistant that knows nothing about this repo and has no project files. Give it only the sentence from the [start page](index.md#assistent) and the material.
2. **Real material.** Use photos of real school material (worksheets, book pages). A description of the photos tests only the writing, not the reading of the images.
3. **Do not help.** Answer like a parent. Tell the assistant nothing the guide does not say.
4. **Build the result.** Save the ZIP and build it locally the way GitHub would:

   ```text
   npm ci
   npm run try -- result.zip
   ```

   The command checks the ZIP with the rules of the submission, builds it with the template at the pinned state (`appTemplates.commit`) and checks the bundle with `lernapps check`. It prints the messages the way the bot comments them on the issue. The first run fetches the template into `_templates/` and takes a few minutes; later runs are faster. The built bundle is in `_out/site`.
5. **The error cycle.** Give the messages unchanged to the assistant, let it correct the ZIP and build again. Count the runs and the messages per run.
6. **Learn from the errors.** Every message the assistant could not solve alone belongs in the skill, as a stumbling block or a row in `references/build-meldungen.md`. Then `npm run llms` and a new test.

## The danger {#gefahr}

- **A description instead of photos.** A test with a description of the photos says nothing about whether the assistant reads photos correctly: order, margins, handwriting, boxes. State in the table below what a test did not check.
- **Never put material in the repo.** Photos, transcripts, descriptions of the material and text from it belong in no commit, issue or pull request. The material is protected by copyright, and a child's handwriting is personal data. The ZIP files of a test also stay outside the repo (the folders `_intake/` and `_out/` are ignored).
- **Facts not checked.** The test shows that the ZIP builds, not that the facts are right. The assistant must say what the parents should check.

## Results {#ergebnisse}

| Test | Who | Input | Build | `lernapps check` | Limit |
| --- | --- | --- | --- | --- | --- |
| 1 | An agent with background knowledge of the repo | Photos | 3 runs: 12 messages, 2 messages, none | no finding (8 rules) | The background knowledge helped; the guide was not alone. The stumbling blocks came from the messages. |
| 2 | A fresh session, only the guide | A description of the photos | 1 run, no message | no finding | Reading the images was not part of the test. |

Open: a test of a fresh session with photos, and a run on GitHub with the bot instead of `npm run try`.
