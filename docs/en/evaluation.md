# Evaluating the guide

A manual process, until there are automatic evals. This page explains to an agent, for example the AI assistant of someone who maintains the repo, how to start a new session after a change to `llms.txt`, the plan template or the skills, play the creator in it and evaluate the result.
## What the guide is made of {#source}

| Part | Content |
| --- | --- |
| [llms.txt](llms.txt) | The entry: create a folder, download the plan template, follow it. |
| `guidance/plan-template.md` | The plan template with the phases of the tooling: Explore, Plan, Code, Commit. It installs and names the skills of each phase and says at which checkpoints the assistant waits for the creator (proposal, pages, submission, address). |
| `lernapps-practice-explore` | Explore: one question for what only the creator knows; catalogue, notes; the scope from the material. |
| `lernapps-practice-plan` | Plan: a brief proposal with the focus, pages that explain before they practise, richer forms and marked guesses. |
| `lernapps-practice-photos` | Explore and Code: reading photos, rebuilding figures with the same content. |
| `lernapps-practice-submit` | Commit: show every page and go through the declarations, the ZIP file of `src/`, the form, answers and corrections. |

In Plan and Code the assistant uses the content skills of the tooling (`lernapps-explainer`, `lernapps-explainer-design`, `lernapps-content-questions`, `lernapps-exercise-patterns`, `lernapps-content-research`, `lernapps-cli`). A test checks that the plan template installs exactly these skills, each in the phase that loads it first, and that the addresses of `llms.txt` are right.

## Start a session {#method}

1. **A fresh session.** Start an assistant with a shell (Node 22.18 or newer, git, network), without prior knowledge of this repo and without project files. Give it only the sentence from the [start page](index.md#assistant).
2. **Allow the commands.** The plan template runs `npx skills add`, `create` and `npm`. Many environments ask for approval; a session in auto mode without a person blocks `npx skills add`. Allow the commands beforehand, or start the assistant as a sub-agent where they may run.
3. **Play the creator.** Answer like a parent: briefly, without help the guide does not give. Give real photos of school material, outside the app's folder. A description of the photos tests only the writing, not the reading of the images.

## Observe {#observe}

- How often does the assistant ask, and does it wait only at the checkpoints (proposal, pages, submission, address)?
- Does the folder hold exactly the skills of the table above and `app-content`, each from its phase on?
- Is the proposal brief, are the guesses marked, does it stay within the scope of the material?
- Does the assistant show every page before the submission?

## Submit {#submit}

- **Locally:** save the ZIP and build it the way GitHub would:

  ```text
  npm ci
  npm run try -- result.zip
  ```

  The command checks the ZIP with the rules of the submission, builds it with the template at the state the tooling pins on `main` (`appTemplates.commit`; another one with `--commit <sha>`) and checks the bundle with `lernapps check`. It prints the messages the way the bot comments them on the issue. The built bundle is in `_out/site`.
- **On GitHub, without a browser:** create a test issue in the format of the form and start the workflow "Submission" with `issue` and `zip_url` ([Operations](operations.md#repeat)). Give the bot's comment unchanged to the assistant.

## Evaluate {#evaluate}

- Open every page of the preview in a browser: does it explain before it practises? Do figures and letters match the material? Is a placeholder left unfilled anywhere? Does the console report errors?
- Count the runs up to the address and the messages per run.
- Assign each finding: the guide (plan template, skills of practice) you change here; content skills and checks go into an issue at lernapps/tooling, faults of the runtime into an issue at lernapps/app-templates, each with a test example.
- At most three runs per change; improve between two runs.

## The danger {#danger}

- **A description instead of photos.** A test with a description of the photos says nothing about whether the assistant reads photos correctly: order, margins, handwriting, boxes. State in the table below what a test did not check.
- **Never put material in the repo.** Photos, transcripts, descriptions of the material and text from it belong in no commit, issue or pull request. The material is protected by copyright, and a child's handwriting is personal data. The ZIP files of a test also stay outside the repo (the folders `_intake/` and `_out/` are ignored).
- **Facts not checked.** The test shows that the ZIP builds, not that the facts are right. The assistant must say what the parents should check.

## Results {#results}

| Test | Who | Input | Build | `lernapps check` | Limit |
| --- | --- | --- | --- | --- | --- |
| 1 | An agent with background knowledge of the repo | Photos | 3 runs: 12 messages, 2 messages, none | no finding (8 rules) | The background knowledge helped; the guide was not alone. The stumbling blocks came from the messages. |
| 2 | A fresh session, only the guide | A description of the photos | 1 run, no message | no finding | Reading the images was not part of the test. |

| 3 to 5 | A fresh session with a shell as a sub-agent, only the guide | Photos | 1 run each, no message | no finding | Submitted through `zip_url` instead of the form. The findings concerned the guide and went into the skills. |

Tests 1 and 2 were of the earlier guide for a chat without a shell. Open: a run with the form in a browser instead of `zip_url`.
