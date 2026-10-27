# Solution Strategy

A family gets a preview without a repository, a server or an account of the platform. GitHub does the work: the
issue is the form, an action builds, Pages serves. Three principles hold across the flow: what is submitted is data
and never code, no job holds more rights than it needs, and everything ends by itself.

```arc42
:::solution-strategy
id: strategy-practice
title: Content is data; rights apart; previews end by themselves
addresses: qg-nothing-collected, qg-safe-input, qg-quick, qg-understandable
:::
```

| Quality goal | Approach |
|---|---|
| `qg-nothing-collected` | The built app is checked by the platform's rules for tracking, requests before a click and own data only; the learning state is never part of the content or of the repository; the issue's comments repeat no field of the form. |
| `qg-safe-input` | The ZIP file is read by the library without trust: allowed address, allowed endings, names, depth and sizes checked in the directory and again while unpacking; the explainer's built-in blocks are the only code; intake and build can only read; publish runs only code of the repository (`concept-content-is-data`, `concept-rights-split`, `concept-bounded-input`). |
| `qg-quick` | The flow is a chain of jobs with no queue of its own; the check of the bundle takes seconds; publish waits only until the address serves the build, and at most five minutes. |
| `qg-understandable` | Every rejection and every failed build ends in one comment in plain German with what to change; the comment is updated in place; an edit of the issue starts the check again. |

## Submit by issue

A parent submits through a GitHub issue form with the content as an attachment, not through a pull request. A
fork's pull request gets no token with write rights and so no preview; parents should not have to fork a repository
(`dec-issue-not-pull-request`).

## Build on GitHub

GitHub Actions build the app on a runner. The build tools need native programs, which the browser cannot load
(`dec-github-builds`).

## Jobs with rights of their own

`intake` reads, `build` reads without a secret, `publish` writes and runs only code of the repository. Between them
are artifacts that count as data (`dec-rights-split`).

## One pinned template, one pinned set of rules

The template and the bundle rules come from lernapps/app-templates and lernapps/tooling at commits that
`package.json` pins and that move with the tooling's (`dec-pinned-template-and-rules`).

## Previews that end

A preview lasts two weeks. A thumbs-up from a person keeps it, closing the issue ends it, a daily cleanup removes what
is over, and `gh-pages` is rewritten as one commit so that removed content is in no history (`dec-temporary-preview`).

## The learning state stays with the child

The content is data for the explainer. What the app remembers lives in the browser of the child's device
(`dec-learning-state-local`).
