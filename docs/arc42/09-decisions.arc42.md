# Architecture Decisions

The decisions are the owner's. Each one gives its context, the decision, what was rejected and the consequences.

## Issue instead of pull request

**Context:** A pull request from a fork gets a token without write rights, so it gets no preview. Parents should not
have to fork a repository. The attachment of an issue can be loaded by a workflow without a login (measured).
**Decision:** A submission is a GitHub issue from a form, with the content attached as a ZIP file. **Rejected:** a pull
request from a fork. **Consequences:** Any GitHub account can start a run (`risk-any-account-starts-runs`). The
workflow loads from `github.com/user-attachments/files/` only. The submitter edits the issue to correct the content.

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
**Rejected:** a build in the browser. **Consequences:** The block depends on Actions and its runners
(`risk-github-dependence`). A run takes minutes, not seconds.

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

**Context:** What a preview serves comes from any GitHub account and is served from the origin of lernapps.net
(`con-shared-origin`). **Decision:** Only the built-in blocks of the explainer: no `src/components`, no `main.ts`, no
`.vue`, `.ts`, `.js` or `.svg` file. **Rejected:** code in submissions. **Consequences:** The content has less
freedom, and every preview looks like the template. Checks look at endings and names, not at what the text says
(`risk-content-unchecked`).

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

**Context:** The build runs the template's tools on files from outside. **Decision:** `intake` and `build` can only
read; `publish` writes and runs only code of this repository; between them are artifacts, which count as data.
**Rejected:** one job that reads, builds and writes. **Consequences:** More plumbing in the workflow: artifacts to pass
on, a second check of the built site in `publish`, and a comment for the case that `build` fails.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-rights-split
title: Rights apart
status: accepted
addresses: qg-safe-input, con-github, risk-any-account-starts-runs
:::
```

## The learning state stays in the browser

**Context:** The child's progress is private, and the preview is public. **Decision:** The learning state stays in the
browser, never in the content and never in the repository. **Rejected:** a state kept by the platform, which would need a
server (`con-static-pages`). **Consequences:** The state is missing on another device, and the preview needs no sign-up.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-learning-state-local
title: The learning state stays in the browser
status: accepted
addresses: qg-nothing-collected, con-static-pages, con-public-by-default
:::
```

## Previews are temporary

**Context:** A preparation is for one test, and its content comes from a family. **Decision:** A preview lives two
weeks; a thumbs-up on the issue keeps it; closing the issue ends it; a daily cleanup removes what is over. The writes of
`i/` on `gh-pages` are one commit without a parent, pushed with a lease. **Rejected:** permanent previews.
**Consequences:** Removed content is in no history of the branch after the next write of `i/`. The deployment of the
site and the pull request previews add ordinary commits that keep `i/` as it is. GitHub may keep unreachable commits
for a while (`risk-history-kept-by-github`). A run that loses the lease is repeated.

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

**Context:** The explainer template and the rules of `lernapps check` for a bundle (`docs/pruefungen.md`) are
owned by other repositories. **Decision:** This block takes both from lernapps/app-templates and lernapps/tooling and
pins them by commit: `appTemplates.commit` in `package.json`, the same one as the tooling's. **Rejected:** a copy of the
template or of the rules in this repository. **Consequences:** A new commit of the template is taken together with the
tooling's and tried with a test issue (`risk-template-pin`). The rules cannot be loosened here.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-pinned-template-and-rules
title: The template and the rules are taken and pinned
status: accepted
addresses: con-pinned-sources, con-explainer-only, risk-template-pin
:::
```
