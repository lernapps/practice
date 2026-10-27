# Introduction and Goals

A parent whose child has a test coming up gets a practice app for it. The family's AI assistant writes the content of
a small learning app from the family's school material. The parent submits that content as a ZIP file in a GitHub
issue. GitHub checks it, builds an app from the explainer template and publishes it at an address of its own,
`lernapps.net/practice/i/<issue number>/`. The preview ends after two weeks, unless a person keeps it.

This is the inner view of the building block "Practice" in the
[architecture of the whole system](https://lernapps.net/docs/architecture/). That view says what the block gives the
platform and which neighbours it has; this one says how the block is built. The repository holds no app and no
runtime: every preview is made from the submitted content, the explainer template of lernapps/app-templates and the
checks of lernapps/tooling.

## 1.1 Requirements Overview

| # | Use case | Outcome |
|---|---|---|
| UC-1 | Prepare | The family's assistant knows what to ask, how to read the material, how to write content of its own and how to hand it over |
| UC-2 | Submit | The parent hands over the content with a form and a GitHub account, without a repository of their own |
| UC-3 | Correct | A rejected submission comes back with a message in plain language that the assistant can act on |
| UC-4 | Practise | The child opens the preview at its own address, without sign-up and without installation |
| UC-5 | Let it end | A preview ends by itself; a person keeps it with a thumbs-up on the issue; closing the issue ends it at once |
| UC-6 | Run | Maintainers repeat a run for an issue and see what a cleanup would delete before it deletes |

How a kept preparation becomes an entry of the catalog is outside this block: it ends at keeping the preview.

## 1.2 Quality Goals

- `qg-nothing-collected`: a preview sends nothing before a click and sets no cookie; the learning state stays in the
  child's browser.
- `qg-safe-input`: content from any GitHub account runs no code under lernapps.net and cannot harm the runner that
  reads it.
- `qg-quick`: the parent gets the address a few minutes after submitting.
- `qg-understandable`: every rejection says in plain language what to change.

See [10-quality-requirements.arc42.md](10-quality-requirements.arc42.md) for the goals with priorities and
measurable scenarios.

## 1.3 Stakeholders

| Role | Contact | Expectations |
|---|---|---|
| Parent | any GitHub account | A preview within minutes; no repository, no code; messages they can pass on to the assistant |
| Child | indirectly | An app that starts at once, needs no account and keeps what it learns on the device |
| Family's AI assistant | any assistant that reads `llms.txt` | A clear order of steps, the limits of a ZIP file and error messages it can fix |
| Maintainers of practice | lernapps/practice | Little to operate: rights kept apart, runs that can be repeated, cleanup that can be tried first |
| Platform owner | Oliver Jägle ([@mrsimpson](https://github.com/mrsimpson)) | Content from outside that can neither run code under lernapps.net nor stay in the history of the site |
| Maintainers of the template and the checks | lernapps/app-templates, lernapps/tooling | One pinned version of both, used here as in the tooling |
