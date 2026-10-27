# Cross-cutting Concepts

The platform-wide concepts are in the [architecture of the whole system](https://lernapps.net/docs/architecture/);
these are the ones that decide how this block is built. Why they hold is in chapter 9.

## Rights apart

A submission passes through jobs, and each holds only the rights it needs: `intake` reads, `build` reads and has no
secret, `publish` writes `gh-pages` and the comment and runs only code of this repository. Between them lie artifacts,
which the next job treats as data. Text from an issue never stands in a `run:` step and is checked strictly where it is
used. Tests of the repository hold the rights and the pins (`test/repo.test.ts`).

```arc42
:::concept
id: concept-rights-split
title: Rights apart, artifacts as data
category: security
:::
```

## Bounded input

Everything from outside is checked by form and size, in two places: the intake reads the directory of the ZIP file
before it unpacks anything, and `publish` checks the built site again. The limits live in one file
(`actions/lib/limits.ts`), and a test compares them with the rules in [docs/regeln.md](../regeln.md).

```arc42
:::concept
id: concept-bounded-input
title: Bounded input
category: security
:::
```

## Temporary preview

`practice.json` beside a preview holds the day it ends. The cleanup decides by these rules:

| Situation | Result |
|---|---|
| The issue is closed | The preview is removed at once, without a note |
| The day has not come | The preview stays |
| The day has come and a person has given a thumbs-up (`term-keep-reaction`) | The preview stays until the issue is closed |
| The day has come and there is no thumbs-up | The preview is removed, with a short note in the issue |
| The issue no longer exists | The preview stays until the day, then it is removed without a note |
| The folder has no readable `practice.json` for its own issue | The folder is removed at once |

Every write of `i/` on `gh-pages` is one new commit without a parent, pushed with a lease against the state it started
from, so that a removed preview is in no history of the branch; a lost lease repeats the change. The deployment of the
site and the pull request previews add ordinary commits and leave `i/` as it is. The length of a preview, the
schedule and the dry run are in [docs/lebensdauer.md](../lebensdauer.md).

```arc42
:::concept
id: concept-temporary-preview
title: Temporary preview
category: operations
:::
```

## One source for the guide

The guide for assistants exists once, as the skills in `skills/`; `docs/llms.txt` is their assembly, and a test says
the checked-in file equals the output of the guide build.

```arc42
:::concept
id: concept-one-guide-source
title: One source for the guide
category: documentation
:::
```
