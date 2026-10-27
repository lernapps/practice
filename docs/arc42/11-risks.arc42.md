# Risks and Technical Debt

Ordered by severity. The risks of the platform as a whole are in the
[architecture of the whole system](https://lernapps.net/docs/architecture/); these are the ones of this block.

## Previews share the origin with lernapps.net

A preview is served from the origin of lernapps.net, so it shares the browser's local storage with the platform's pages
and with the copies of listed apps. Every preview is built from the template under the app name `explainer`, so all
previews also share the prefix of what the template stores (the choice of the tutor and the consent to a video).

```arc42
:::risk
id: risk-shared-origin
title: Previews share the origin with lernapps.net
severity: medium
mitigation: Content is data (dec-content-is-data), so no submitted code runs on the origin; the bundle rule own-data-only is checked at every build.
:::
```

## Any GitHub account can start runs

Anyone with a GitHub account can open an issue and so start a run that downloads a file and builds it.

```arc42
:::risk
id: risk-any-account-starts-runs
title: Any GitHub account can start runs
severity: medium
mitigation: Limits on size, number of files and endings (concept-bounded-input), short runs, rights apart (dec-rights-split); maintainers close or lock issues that are plainly abuse, and a closed issue loses its preview at once.
:::
```

## The content is checked in form, not in substance

The checks look at files, names, sizes and the rules for a bundle. They do not judge whether the facts are right, whether
the text suits the grade or whether it is the family's own work.

```arc42
:::risk
id: risk-content-unchecked
title: The content is checked in form, not in substance
severity: medium
mitigation: The guide tells the assistant not to write unchecked facts into a solution and to say what the parents should verify; the declarations in the form put the responsibility on the submitter; a person looks at the content before it can enter the catalog.
:::
```

## Copyright of the material

Parents make the content from school material. Facts are free, wording and pictures are not.

```arc42
:::risk
id: risk-material-copyright
title: Copyright of the school material
severity: medium
mitigation: The content is written anew and holds no photos of material; the guide says so before the photos are read; the submitter declares it in the form and is the author if the content enters the catalog.
:::
```

## Dependence on GitHub

Issues, attachments, Actions and Pages carry the whole flow. GitHub can change the address form of attachments, the
limits of Actions or the behaviour of Pages. A run can also be lost: GitHub keeps at most one running and one waiting
run per concurrency group and drops the oldest waiting one.

```arc42
:::risk
id: risk-github-dependence
title: Dependence on GitHub
severity: medium
mitigation: The address of an attachment is accepted in one exact form only and a change shows as a rejection with a message; a maintainer repeats a lost run by hand (rs-run-again); the platform's own risk of this dependence is covered in the system architecture.
:::
```

## The pin of the template is moved by hand

`appTemplates.commit` is raised by hand together with the tooling's pin. If the two diverge, the build uses a template
whose rules and check the tooling does not match.

```arc42
:::risk
id: risk-template-pin
title: The pin of the template is moved by hand
severity: low
mitigation: Take the commit from the tooling's package.json and run one test issue before merging (dec-pinned-template-and-rules); the smoke build of the check workflow builds a minimal fixture at the pin on a runner.
:::
```

## GitHub may keep removed commits

A removed preview is in no history of the branch after the next write of `i/`. GitHub may still keep commits that are no
longer reachable for a while, and the issue and its attachment are public until someone deletes them.

```arc42
:::risk
id: risk-history-kept-by-github
title: GitHub may keep removed commits
severity: low
mitigation: The pages for families say so (docs/datenschutz.md); the content holds no personal data by declaration; the submitter deletes the issue and the attachment, or asks a maintainer to.
:::
```

## The frame is run from a copy

`scripts/frame.sh` runs the frame's commands from a copy of the installed frame in `_frame/`, with this site added to
the frame's list of sites when the installed frame does not list it. The copy and the frame can differ in what they
check or add.

```arc42
:::ignore H007 a detail of how the site is built; no decision of this block responds to it :::
:::risk
id: risk-frame-copy
title: The frame is run from a copy
severity: low
mitigation: The copy is made at every run from the pinned frame, and the entry is added only if the frame lacks it; Renovate keeps the pin current.
:::
```
