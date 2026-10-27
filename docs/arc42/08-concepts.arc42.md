# Cross-cutting Concepts

The concepts that hold for several blocks. The platform-wide ones (one domain, privacy by construction, checked rather
than declared, pinned sources) are in the [architecture of the whole system](https://lernapps.net/docs/architecture/);
these are the ones that decide how this block is built.

## Content is data, not code

A submission is content for the explainer: YAML, Markdown and images below `src/`. Only the explainer's built-in blocks
exist for it. `src/main.ts` and `src/components/` belong to the template and are not part of a submission, and
scripts, SVG, HTML, JSON and Vue or TypeScript files are refused by ending. The build runs the template's tools over
the data and never runs the content as a program. So content from any GitHub account runs no code under lernapps.net:
the built app consists of the template's code and the content's data.

```arc42
:::concept
id: concept-content-is-data
title: Content is data, not code
category: security
:::
```

## Rights apart

A submission passes through jobs, and each holds only what it needs. `intake` reads the issue and loads the ZIP file;
it can write nothing to GitHub. `build` has read access to the repository and no secret; it can neither change issues
nor branches. `publish` can write `gh-pages` and the comment, and runs only code of this repository. Between them lie
artifacts, which the next job treats as data: `publish` checks the built site again before it writes. Text from the
issue never stands in a `run:` step; it reaches scripts through files and environment variables, and the scripts check
it strictly (the issue number against `^[1-9][0-9]{0,8}$`, the attachment address against its one allowed form).
Actions of others are pinned to commits.

```arc42
:::concept
id: concept-rights-split
title: Rights apart, artifacts as data
category: security
:::
```

## Temporary preview

A preview has an end. `practice.json` beside it holds the day, 14 days after the build. The rules, applied by the
cleanup:

| Situation | Result |
|---|---|
| The issue is closed | The preview is removed at once, without a note, even with a thumbs-up |
| The day has not come | The preview stays |
| The day has come and a person (not a bot) has reacted with a thumbs-up to the first field of the issue | The preview stays until the issue is closed |
| The day has come and there is no such reaction | The preview is removed, with a short note in the issue |
| The issue no longer exists | The preview stays until the day, then it is removed without a note |
| The folder has no readable `practice.json` for its own issue | The folder is removed at once |

The cleanup runs daily, when an issue is closed and by hand (by default as a dry run). A new submission for the same
issue replaces the folder and starts the days again. Every write of `i/` is one new commit without a parent, pushed
with a lease against the state it started from, so that a removed preview is in no history of the branch; if the lease
fails, the change is made again on the new state. The deployment of the site and the pull request previews add
ordinary commits above and leave `i/` as it is; the next write of `i/` makes one commit of the branch again.

```arc42
:::concept
id: concept-temporary-preview
title: Temporary preview
category: operations
:::
```

## The learning state stays local

What a child enters or chooses in the app stays in the browser of the child's device. It is never part of the content
and never stored in the repository; the platform sees the content as data and never photos, names or learning state.
The built app is checked for cookies and sending (`no-tracking`), for requests before a click
(`no-request-before-click`) and for touching only its own data (`own-data-only`), and a failing rule stops the
publication. The comments of the workflows repeat no field of the form.

```arc42
:::concept
id: concept-learning-state-local
title: The learning state stays in the child's browser
category: privacy
:::
```

## Bounded input

Everything that comes from outside is checked in two places and by size. The attachment address must have the form
`https://github.com/user-attachments/files/<number>/<name>.zip`; it is loaded with `curl` over https only, at most five
redirects, 10 MB and 60 seconds, and the final address must lie at GitHub. The library reads the directory of the ZIP
file before it unpacks anything and refuses what is not allowed: the folder `src/` is the only root (one folder around
everything is accepted), names use `a-z A-Z 0-9 - _` and exactly one dot before the ending, no hidden file, no `..`, no
absolute path, no backslash, no link or special file, no encrypted entry, at most six folders deep, only the endings
`yaml`, `yml`, `md`, `png`, `jpg` and `webp`, at most 300 files, 25 MB unpacked, 10 MB per file. Sizes are checked in
the directory and again while unpacking, with a hard limit on the output, so a directory that lies about sizes and
overlapping entries are refused. Fields of the form have fixed lists and lengths. The limits live in one file
(`actions/lib/limits.ts`) and a test compares them with the numbers in the documentation. `publish` repeats a check of
the built site: number and size of files, names, endings, `noindex` on every page.

```arc42
:::concept
id: concept-bounded-input
title: Bounded input
category: security
:::
```
