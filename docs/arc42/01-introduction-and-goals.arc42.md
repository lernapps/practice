# Introduction and Goals

A creator (a parent, a teacher or a developer) who has an acute occasion, such as a class test or an absence, gets a
practice app for it. The creator's AI assistant writes the content of a small learning app from the school material. The
creator submits that content as a ZIP file in a GitHub issue. GitHub checks it, builds an app from the explainer template and publishes it at an address of its own,
`lernapps.net/practice/i/<issue number>/`.

This is the inner view of the building block "Practice" in the
[architecture of the whole system](https://lernapps.net/docs/architecture/). That view says what the block gives the
platform and which neighbours it has; this one says how the block is built. The repository holds no app and no
runtime: every preview is made from the submitted content, the explainer template of lernapps/app-templates and the
checks of lernapps/tooling.

## 1.1 Requirements Overview

| # | Use case | Outcome |
|---|---|---|
| UC-1 | Prepare | The creator's assistant knows what to ask, how to read the material, how to write content and how to hand it over |
| UC-2 | Submit | The creator hands over the content with a form and a GitHub account, without a repository of their own |
| UC-3 | Correct | A rejected submission comes back with a message that the assistant can act on |
| UC-4 | Practise | The student opens the preview at its own address, without sign-up and without installation |
| UC-5 | Let it end | A preview ends by itself, a person can keep it, closing the issue ends it (`concept-temporary-preview`) |
| UC-6 | Run | Maintainers repeat a run for an issue and see what a cleanup would delete before it deletes |

How a kept preparation becomes an entry of the catalog is outside this block: it ends at keeping the preview.

## 1.2 Quality Goals

`qg-nothing-collected`, `qg-safe-input`, `qg-understandable` and `qg-quick`, with priorities and scenarios in
[10-quality-requirements.arc42.md](10-quality-requirements.arc42.md).

## 1.3 Stakeholders

| Role | Contact | Expectations |
|---|---|---|
| Creator | any GitHub account | A preview within minutes; no repository, no code; messages they can pass on to the assistant |
| Student | indirectly | An app that starts at once and needs no account |
| Creator's AI assistant | any assistant that reads `llms.txt` | A clear order of steps and error messages it can fix |
| Maintainers of practice | lernapps/practice | Little to operate; runs that can be repeated; a cleanup that can be tried first |
| Platform owner | Oliver Jägle ([@mrsimpson](https://github.com/mrsimpson)) | Content from outside is safe for the platform and leaves no trace (`qg-safe-input`, `dec-temporary-preview`) |
| Maintainers of the template and the checks | lernapps/app-templates, lernapps/tooling | One pinned version of both (`dec-pinned-template-and-rules`) |
