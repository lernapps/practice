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
mitigation: dec-content-is-data, so no submitted code runs on the origin; the bundle rule own-data-only (qs-preview-collects-nothing).
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

The checks do not judge whether the facts are right, whether the text suits the grade or whether it is the family's own
work.

```arc42
:::risk
id: risk-content-unchecked
title: The content is checked in form, not in substance
severity: medium
mitigation: The guide tells the assistant to say what the parents should verify; the submitter's declarations (con-public-by-default); a person looks at the content before it can enter the catalog.
:::
```

## Copyright of the material

Parents make the content from school material. Facts are free, wording and pictures are not.

```arc42
:::risk
id: risk-material-copyright
title: Copyright of the school material
severity: medium
mitigation: The content is written anew and holds no photos of material; the guide says so before the photos are read; the submitter's declarations (con-public-by-default).
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

## The pin of the template is moved by hand

If the pin of the template and the tooling's diverge, the build uses a template whose rules the tooling does not match.

```arc42
:::risk
id: risk-template-pin
title: The pin of the template is moved by hand
severity: low
mitigation: dec-pinned-template-and-rules; the smoke build of the check workflow builds a fixture at the pin on a runner.
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
mitigation: The pages for families say so (docs/datenschutz.md); the submitter deletes the issue and the attachment, or asks a maintainer to.
:::
```
