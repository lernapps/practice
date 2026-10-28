# Risks and Technical Debt

Ordered by severity. The risks of the platform as a whole are in the
[architecture of the whole system](https://lernapps.net/docs/architecture/); these are the ones of this block.

## Previews share the origin with lernapps.net

Because of `con-shared-origin`, a preview shares the browser's local storage with the platform's pages and the copies of
listed apps. Every preview is built under the app name `explainer`, so all previews also share the prefix of what the
template may store.

```arc42
:::risk
id: risk-shared-origin
title: Previews share the origin with lernapps.net
severity: medium
mitigation: dec-content-and-components, so component code passes the build's checks and an SVG image only draws (concept-svg-only-draws); the bundle rule own-data-only (qs-preview-collects-nothing).
:::
```

## Submitted code shares the origin without review

A component is code from any GitHub account. It runs in the build job and, once published, in the browsers of the
students on the shared origin. Nobody reviews it before the preview goes online; only the build's checks stand between.

```arc42
:::risk
id: risk-submitted-code
title: Submitted code shares the origin without review
severity: high
mitigation: The build's checks of component code (no network, no eval or innerHTML, allowed imports, browser globals only after mounting, size) and the bundle rules own-data-only, no-tracking and no-request-before-click; the build job holds no right and no secret (dec-rights-split); maintainers close an issue to remove its preview at once.
:::
```

## Any GitHub account can start runs

Anyone with a GitHub account can open an issue and so start a run.

```arc42
:::risk
id: risk-any-account-starts-runs
title: Any GitHub account can start runs
severity: medium
mitigation: concept-bounded-input and dec-rights-split; maintainers close or lock issues that are plainly abuse, and a closed issue loses its preview.
:::
```

## The content is checked in form, not in substance

The checks do not judge whether the facts are right, whether the text suits the grade or whether it is the creator's own
work.

```arc42
:::risk
id: risk-content-unchecked
title: The content is checked in form, not in substance
severity: medium
mitigation: The guide tells the assistant to say what the creator should verify; the submitter's declarations (con-public-by-default); a person looks at the content before it can enter the catalog.
:::
```

## Copyright of the material

Creators make the content from school material. Facts are free, wording and pictures are not.

```arc42
:::risk
id: risk-material-copyright
title: Copyright of the school material
severity: medium
mitigation: The content is written anew and holds no photos of material; the skill lernapps-practice-photos has figures rebuilt with the same content, never copied; the submitter's declarations (con-public-by-default).
:::
```

## Dependence on GitHub

GitHub can change the address form of attachments, the limits of Actions or the behaviour of Pages. A run can also be
lost when a concurrency group drops a waiting run.

```arc42
:::risk
id: risk-github-dependence
title: Dependence on GitHub
severity: medium
mitigation: The address of an attachment is accepted in one exact form, so a change shows as a rejection with a message; a maintainer repeats a lost run by hand (rs-run-again); the platform's own risk of this dependence is in the system architecture.
:::
```

## The pin of the template follows the tooling's main

The build takes whatever commit the tooling's main pins at the time of the run. A broken pin there breaks every build
here, and a submission made before a move is built with the new template.

```arc42
:::risk
id: risk-template-pin
title: The pin of the template follows the tooling's main
severity: low
mitigation: dec-pin-from-tooling-main; the tooling's own tests build the template at its pin; the smoke build of the check workflow builds a fixture at the pin on a runner; a failed read stops the build with a clear message.
:::
```

## GitHub may keep removed commits

GitHub may keep commits that are no longer reachable for a while, and the issue and its attachment are public until
someone deletes them.

```arc42
:::risk
id: risk-history-kept-by-github
title: GitHub may keep removed commits
severity: low
mitigation: docs/privacy.md says so; the submitter deletes the issue and the attachment, or asks a maintainer to.
:::
```
