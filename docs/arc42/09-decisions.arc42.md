# Architecture Decisions

The decisions are the owner's. Each one gives its context, the decision, what was rejected and the consequences.

## Issue instead of pull request

**Context:** A pull request from a fork gets a token without write rights, so it gets no preview, and creators should
not have to fork a repository. A workflow can load the attachment of an issue without a login (measured).
**Decision:** A submission is a GitHub issue from a form, with the content attached as a ZIP file. **Rejected:** a pull
request from a fork. **Consequences:** Any GitHub account can start a run (`risk-any-account-starts-runs`). The
submitter attaches a corrected version as a comment of the issue (`term-latest-upload`).

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

## Content and components, checked by the build

**Context:** A preview serves what any GitHub account sent, from the shared origin (`con-shared-origin`). The
creator's assistant builds the explainer with `create` and may write components and figures, as any explainer has.
**Decision:** A submission is the explainer's `src/`: data, images and components. The explainer's build checks the
content and each component's code (no network, no `eval` or `innerHTML`, allowed imports, size, a test, the exercise
contract), and the build job runs the components' tests; an SVG image passes only when it only draws
(`concept-svg-only-draws`); the template's `main.ts` stays. **Rejected:** content as data only, without components and
figures; code in other places than `src/components/`. **Consequences:** The build job runs submitted code without
review (`risk-submitted-code`), which is why it holds nothing (`dec-rights-split`). The checks look at form and code,
not at meaning (`risk-content-unchecked`).

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-content-and-components
title: Content and components, checked by the build
status: accepted
addresses: qg-safe-input, con-explainer-only, con-shared-origin, risk-shared-origin, risk-submitted-code, risk-content-unchecked
:::
```

## Rights apart

**Context:** The build runs the template's tools and the submitted components' code on files from outside. **Decision:** The jobs are split as
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

## Nothing about the student is stored

**Context:** The student's progress is private, and the preview is public. **Decision:** The app stores nothing about the
student; the page counts answers in memory while it is open, and a state that a later learning control keeps stays on the
student's device. The rules of the platform for a bundle check it at every build (`qs-preview-collects-nothing`).
**Rejected:** a state kept by the platform, which would need a server (`con-static-pages`). **Consequences:** A reload
or another device starts again, and the preview needs no sign-up.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-nothing-stored
title: Nothing about the student is stored
status: accepted
addresses: qg-nothing-collected, con-static-pages, con-public-by-default
:::
```

## Previews are temporary

**Context:** A preparation is for one occasion, and its content comes from a private person. **Decision:** A preview has an end
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

## The template at the tooling's pin, read from its main

**Context:** The explainer template and the rules of `lernapps check` (`docs/pruefungen.md`) belong to other
repositories, and the assistant creates the app with `create` from `tooling#main`. **Decision:** At every run the build finds
the commit of the tooling's main (`git ls-remote`, without a token), reads `appTemplates.commit` from its package.json,
and checks with `@lernapps/tooling` of that same commit; it stops when it cannot. This repository keeps no pin of its
own. **Rejected:** a pin here, moved by hand; a copy of the template or
of the rules. **Consequences:** GitHub builds with the template state the creator's app was made from, and a move of
the pin in the tooling reaches the next build at once (`risk-template-pin`). The rules cannot be loosened here.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-pin-from-tooling-main
title: The template at the tooling's pin, read from its main
status: accepted
addresses: con-pinned-sources, con-explainer-only, risk-template-pin
:::
```

## A plan and skills per phase for the assistant

**Context:** The assistant has a shell, and the tooling leads its assistants through a plan in phases. **Decision:**
The guide is a short start, the plan template and three skills of this repository (`concept-plan-and-phase-skills`);
the content skills and `create` are the tooling's. **Rejected:** a chat flow in one document; own copies of the
tooling's skills. **Consequences:** The assistant needs Node, git and the network on the creator's computer. A change
of the tooling's skills reaches practice apps at once.

```arc42
:::ignore W008 the day of the owner's decision is not recorded :::
:::decision
id: dec-plan-and-phase-skills
title: A plan and skills per phase for the assistant
status: accepted
addresses: qg-understandable, con-explainer-only, risk-content-unchecked
:::
```
