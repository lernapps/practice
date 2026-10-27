# Architecture Decisions

The decisions are the owner's. Each one gives its context, the decision, what was rejected and the consequences.

## Issue instead of pull request

**Context:** A pull request from a fork gets a token without write rights, so it gets no preview, and parents should
not have to fork a repository. A workflow can load the attachment of an issue without a login (measured).
**Decision:** A submission is a GitHub issue from a form, with the content attached as a ZIP file. **Rejected:** a pull
request from a fork. **Consequences:** Any GitHub account can start a run (`risk-any-account-starts-runs`). The
submitter corrects the content by editing the issue.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-issue-not-pull-request
title: Issue instead of pull request
status: accepted
addresses: con-github, qg-quick, qg-understandable, risk-any-account-starts-runs
:::
```

## GitHub builds, not the browser

**Context:** The tools that build the template need native programs, which the browser cannot load: WebContainers do
not load the `.node` file that `vite-plus` needs (measured). **Decision:** GitHub Actions build the app on a runner.
**Rejected:** a build in the browser. **Consequences:** The block depends on Actions (`risk-github-dependence`). A run
takes minutes, not seconds.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-github-builds
title: GitHub builds, not the browser
status: accepted
addresses: con-github, con-explainer-only, risk-github-dependence
:::
```

## Content is data, not code

**Context:** A preview serves what any GitHub account sent, from the shared origin (`con-shared-origin`).
**Decision:** Only the built-in blocks of the explainer: the build runs the template's tools over the data and never
runs the content as a program. **Rejected:** code in submissions. **Consequences:** Content has less freedom, and every
preview looks like the template. The checks look at endings and names, not at meaning (`risk-content-unchecked`).

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-content-is-data
title: Content is data, not code
status: accepted
addresses: qg-safe-input, con-explainer-only, con-shared-origin, risk-shared-origin, risk-content-unchecked
:::
```

## Rights apart

**Context:** The build runs the template's tools on files from outside. **Decision:** The jobs are split as
`concept-rights-split` says. **Rejected:** one job that reads, builds and writes. **Consequences:** More plumbing:
artifacts to pass on, a second check in `publish`, and a comment for the case that `build` fails.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-rights-split
title: Rights apart
status: accepted
addresses: qg-safe-input, con-github, risk-any-account-starts-runs
:::
```

## Nothing about the child is stored

**Context:** The child's progress is private, and the preview is public. **Decision:** The app stores nothing about the
child; the page counts answers in memory while it is open, and a state that a later learning control keeps stays on the
child's device. The rules of the platform for a bundle check it at every build (`qs-preview-collects-nothing`).
**Rejected:** a state kept by the platform, which would need a server (`con-static-pages`). **Consequences:** A reload
or another device starts again, and the preview needs no sign-up.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-nothing-stored
title: Nothing about the child is stored
status: accepted
addresses: qg-nothing-collected, con-static-pages, con-public-by-default
:::
```

## Previews are temporary

**Context:** A preparation is for one test, and its content comes from a family. **Decision:** A preview has an end
that a person can lift (`concept-temporary-preview`). **Rejected:** permanent previews. **Consequences:** Removed
content is in no history of the branch. GitHub may keep unreachable commits for a while
(`risk-history-kept-by-github`).

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-temporary-preview
title: Previews are temporary
status: accepted
addresses: qg-nothing-collected, con-public-by-default, risk-material-copyright, risk-history-kept-by-github
:::
```

## The template and the rules are taken and pinned

**Context:** The explainer template and the rules of `lernapps check` (`docs/pruefungen.md`) belong to other
repositories. **Decision:** This block takes both at the commit that `appTemplates.commit` pins, the tooling's.
**Rejected:** a copy of the template or of the rules here. **Consequences:** A new commit is tried with a test issue
(`risk-template-pin`). The rules cannot be loosened here.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-pinned-template-and-rules
title: The template and the rules are taken and pinned
status: accepted
addresses: con-pinned-sources, con-explainer-only, risk-template-pin
:::
```
