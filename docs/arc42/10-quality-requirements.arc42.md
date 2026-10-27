# Quality Requirements

The goals are the ones this block must meet beyond the platform's own (see the
[architecture of the whole system](https://lernapps.net/docs/architecture/)). Every scenario names how it is measured.

## 10.1 Quality goals

| Goal | Priority |
|---|---|
| `qg-nothing-collected` | high |
| `qg-safe-input` | high |
| `qg-understandable` | high |
| `qg-quick` | medium |

### Nothing collected

A child's practice is private. A preview must hold to the platform's promise without anyone reading its content.

```arc42
:::quality-goal
id: qg-nothing-collected
title: Nothing collected
priority: high
:::
```

### Safe against foreign files

Content from any GitHub account is built on a runner and served from the shared origin. Neither may be harmed by it.

```arc42
:::quality-goal
id: qg-safe-input
title: Safe against foreign files
priority: high
:::
```

### Understandable for families

Parents have no development skills, and their assistant sees no logs. The comment is all they have to correct the
content.

```arc42
:::quality-goal
id: qg-understandable
title: Understandable for families
priority: high
:::
```

### Quick to a preview

A test has a day; the longer the wait, the less the preview helps.

```arc42
:::quality-goal
id: qg-quick
title: Quick to a preview
priority: medium
:::
```

## 10.2 Quality scenarios

### A preview collects nothing

A child opens a preview and practises.

```arc42
:::quality-scenario
id: qs-preview-collects-nothing
title: A preview collects nothing
quality: qg-nothing-collected
stimulus: A child opens a preview and practises
response: The preview sends nothing to other servers before a click, sets no cookie and touches only its own data in the browser (the template stores only a tutor choice and a video choice, which these previews do not offer)
metric: The bundle passes no-tracking, no-request-before-click and own-data-only in the build that made it; a build that fails any rule is not published
:::
```

### A preview ends

The preview is over by the rules of `concept-temporary-preview`.

```arc42
:::quality-scenario
id: qs-preview-ends
title: A preview ends
quality: qg-nothing-collected
stimulus: The preview is over by the rules of concept-temporary-preview
response: The preview is removed and no history of the branch holds it
metric: Removed by the next daily run at the latest, at once when the issue is closed
:::
```

### A hostile ZIP file

Someone submits a ZIP file with hostile content.

```arc42
:::quality-scenario
id: qs-hostile-zip
title: A hostile ZIP file
quality: qg-safe-input
stimulus: A ZIP file with hostile paths, forbidden endings, links, encrypted entries or sizes that lie
response: The intake refuses it before anything outside src/ is written and before any build starts, and the comment says what is wrong
metric: The tests of the ZIP reader cover hostile paths, name tricks, endings, kinds of entries, sizes and bombs, within the limits of concept-bounded-input
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
response: The job can change neither issues nor branches and uses no secret
metric: A test of the repository fails when the workflow gives the job build more than the rights of concept-rights-split
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
response: The comment with the address appears; if the address does not serve the build yet, the comment says so
metric: A few minutes after the submission; publish waits at most 300 s for the address and then comments anyway
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
response: One comment, updated in place, says in plain German what to change; for a failed build it shows file, line and rule, so that the assistant can correct the content without asking the parent
metric: The comment is bounded in length, and no text of the submission is read as Markdown, HTML or a mention
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
response: The check and the build run again and replace the comment and the preview (rs-run-again)
metric: No step besides the edit
:::
```
