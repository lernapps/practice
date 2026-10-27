# Architecture Constraints

The constraints come from the platform and the organisation's rules across repos
([ORGANIZATION.md](https://github.com/lernapps/.github/blob/main/ORGANIZATION.md)) and from the way GitHub works. The
[architecture of the whole system](https://lernapps.net/docs/architecture/) holds the constraints of the platform;
these are the ones that shape this block.

## Only the explainer, only its data

A preview is an app of the archetype `explainer`, made from the template of lernapps/app-templates at the pinned
commit. The template stays as it is: its `main.ts` is kept, its components do not exist for a preview, and the content
is the YAML, Markdown and images below `src/` that the explainer's schema describes.

```arc42
:::constraint
id: con-explainer-only
title: Only the explainer, only its data
category: technical
source: docs/regeln.md; docs/pruefungen.md; app-templates explainer README
:::
```

## GitHub is the means of production

Issues, their attachments, Actions and Pages carry the whole flow. A token of a pull request from a fork cannot write,
and a workflow can load the attachment of an issue without a login. There is no server of this block's own.

```arc42
:::constraint
id: con-github
title: GitHub is the means of production
category: organizational
source: Platform design; ORGANIZATION.md "Rules across repos"; docs/betrieb.md
:::
```

## Static files below lernapps.net

GitHub Pages serves the branch `gh-pages` of the repository at `lernapps.net/practice/`. A preview is a folder of
static files on that branch; nothing runs on the server side.

```arc42
:::constraint
id: con-static-pages
title: Static files below lernapps.net
category: technical
source: docs/betrieb.md "Einstellungen im Repo"
:::
```

## The origin is shared

Every preview is served from the origin of lernapps.net, like the platform's pages and the copies of listed apps. The
browser's local storage is therefore shared with all of them.

```arc42
:::constraint
id: con-shared-origin
title: The origin is shared with the platform
category: technical
source: docs/datenschutz.md "Die App speichert nichts über das Kind"
:::
```

## Everything submitted is public

The issue, the link to the ZIP file and the preview are public. The content is therefore written anew, without
personal data and without photos of material, and the person who submits declares it in the form.

```arc42
:::constraint
id: con-public-by-default
title: Everything submitted is public
category: organizational
source: docs/datenschutz.md; docs/regeln.md "Die drei Erklärungen"
:::
```

## Sources are pinned

Actions of others are pinned to full commit SHAs and kept current by Renovate. The explainer template is pinned by
`appTemplates.commit` in `package.json`, and the pin is the one of the tooling.

```arc42
:::constraint
id: con-pinned-sources
title: Sources are pinned to a commit
category: convention
source: ORGANIZATION.md "Rules across repos"; test/repo.test.ts; docs/betrieb.md "Updates"
:::
```

## Languages and licence

Texts for learners and families are German in plain language (ISO 24495-1). The pages of this repository are German
and English; identifiers, code and this model are English. The code is MIT licensed. Content that enters the catalog is
published under CC BY 4.0, with the person who submitted it as its author.

```arc42
:::ignore H006 an organisation rule for texts and licences; no decision of this block responds to it :::
:::constraint
id: con-language-licence
title: Languages and licence
category: convention
source: ORGANIZATION.md "Language", "License"; LICENSE; docs/datenschutz.md "Urheberrecht"
:::
```
