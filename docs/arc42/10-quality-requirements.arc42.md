# Quality Requirements

The goals are the ones this block must meet beyond the platform's own (see the
[architecture of the whole system](https://lernapps.net/docs/architecture/)). Every scenario names how it is measured.

## 10.1 Quality goals

| Goal | Priority | In short |
|---|---|---|
| `qg-nothing-collected` | high | A preview collects nothing; the app stores nothing about the child |
| `qg-safe-input` | high | Foreign files neither run code nor harm the runner |
| `qg-understandable` | high | A rejection says in plain language what to change |
| `qg-quick` | medium | The address arrives a few minutes after the submission |

### Nothing collected

The platform promises that apps collect nothing, and a child's practice is private. A preview must hold to this
without anyone reading its content.

```arc42
:::quality-goal
id: qg-nothing-collected
title: Nothing collected
priority: high
:::
```

### Safe against foreign files

The content comes from any GitHub account and is served from the origin of lernapps.net, after a build on a runner.
Neither the served app nor the runner may be harmed by it.

```arc42
:::quality-goal
id: qg-safe-input
title: Safe against foreign files
priority: high
:::
```

### Understandable for families

Parents have no development skills, and their assistant has no access to the logs of the run. What the comment says is
all they have to correct the content.

```arc42
:::quality-goal
id: qg-understandable
title: Understandable for families
priority: high
:::
```

### Quick to a preview

A test has a day. The longer the wait, the less the preview helps.

```arc42
:::quality-goal
id: qg-quick
title: Quick to a preview
priority: medium
:::
```

## 10.2 Quality scenarios

### A preview collects nothing

A child opens a preview and practises. The rules of the platform for a bundle are checked at every build, and a failing
rule means that nothing is published.

```arc42
:::quality-scenario
id: qs-preview-collects-nothing
title: A preview collects nothing
quality: qg-nothing-collected
stimulus: A child opens a preview and practises
response: The preview sends nothing to other servers before a click, sets no cookie and touches only its own data in the browser (the template stores nothing but a tutor choice and a video choice, which these previews do not offer)
metric: The bundle passes no-tracking, no-request-before-click and own-data-only in the build that made it; a build that fails any rule is not published
:::
```

### A preview ends

Two weeks pass, or the issue is closed.

```arc42
:::quality-scenario
id: qs-preview-ends
title: A preview ends
quality: qg-nothing-collected
stimulus: The day in practice.json has come without a thumbs-up of a person, or the issue is closed
response: The preview is removed, and no history of the branch holds it after the next write of i/
metric: Removed by the next daily run at the latest (03:23 UTC), at once when the issue is closed; the write is one commit without a parent
:::
```

### A hostile ZIP file

Someone submits a ZIP file with a path outside `src/`, a script, a link or a zip bomb.

```arc42
:::quality-scenario
id: qs-hostile-zip
title: A hostile ZIP file
quality: qg-safe-input
stimulus: A ZIP file with hostile paths, forbidden endings, links, encrypted entries or sizes that lie
response: The intake refuses it before anything outside src/ is written and before any build starts; the comment says what is wrong in plain language
metric: Limits of 10 MB for the file, 300 files, 25 MB unpacked, 10 MB per file and 60 s for the download; the tests of the ZIP reader cover hostile paths, name tricks, endings, kinds of entries, sizes and bombs
:::
```

### A build cannot write

The build runs the template's tools on files from outside.

```arc42
:::quality-scenario
id: qs-build-cannot-write
title: A build cannot write
quality: qg-safe-input
stimulus: The build runs tools of the template on submitted data
response: The job has read access to the repository only and no secret; it cannot change issues or branches
metric: The workflow gives the job build contents read and nothing else, and uses no secret; a test of the repository fails otherwise
:::
```

### The address comes within minutes

A parent submits the form.

```arc42
:::quality-scenario
id: qs-address-in-minutes
title: The address comes within minutes
quality: qg-quick
stimulus: A parent submits a valid submission
response: The comment with the address of the preview appears; if the address does not serve the build yet, the comment says so
metric: A few minutes after the submission (the check of the bundle takes about ten seconds); publish waits at most 300 s for the address and then comments anyway
:::
```

### A rejection can be acted on

A submission fails.

```arc42
:::quality-scenario
id: qs-rejection-actionable
title: A rejection can be acted on
quality: qg-understandable
stimulus: A submission is rejected, or the build or the check fails
response: One comment, updated in place, says in plain German what to change; for a failed build it shows the messages with file, line and rule, so that the assistant can correct the content without asking the parent
metric: A comment lists up to 12 problems or up to 60 lines of the log; no text of the submission is read as Markdown, HTML or a mention
:::
```

### A parent corrects the content

The parent edits the issue with a corrected ZIP file.

```arc42
:::quality-scenario
id: qs-correct-and-retry
title: A parent corrects the content
quality: qg-understandable
stimulus: The first field of the issue gets a new ZIP file
response: The check and the build run again on their own and replace the comment and the preview
metric: No step besides the edit; an edit that changes neither the ZIP address nor the fields does not build again
:::
```
