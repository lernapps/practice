# Glossary

## Submission

Not a pull request: the issue itself.

```arc42
:::glossary-term
id: term-submission
title: Submission
definition: A GitHub issue made from the form, with the content attached as a ZIP file. It is the unit that is checked, built, published and removed, and its number names the preview.
:::
```

## Preview

Not an app in the catalog: it ends.

```arc42
:::glossary-term
id: term-preview
title: Preview
definition: The temporary app built from a submission, served at `lernapps.net/practice/i/<issue number>/`. It lives two weeks unless a person keeps it.
:::
```

## Content

Data for the explainer, never code.

```arc42
:::glossary-term
id: term-content
title: Content
definition: The YAML, Markdown and image files below `src/` of a submission: the chapters, pages, explanations and tasks of an explainer.
:::
```

## Explainer

One archetype of the app templates.

```arc42
:::glossary-term
id: term-explainer
title: Explainer
definition: The archetype that builds pages of content with an exercise on each page from content files. Every preview is an explainer.
:::
```

## Intake

The first job of a submission.

```arc42
:::glossary-term
id: term-intake
title: Intake
definition: The job that reads the issue, loads and checks the ZIP file and unpacks it as data. It can only read.
:::
```

## Bundle

What `lernapps check` is run on.

```arc42
:::glossary-term
id: term-bundle
title: Bundle
definition: The built static site of a preview before it is published.
:::
```

## Artifact

Data between jobs.

```arc42
:::glossary-term
id: term-artifact
title: Artifact
definition: A file set that one job of a workflow hands to the next. The receiving job never runs anything from it.
:::
```

## Practice record

`practice.json`.

```arc42
:::glossary-term
id: term-practice-record
title: Practice record
definition: The file beside a preview that holds the issue number, the subject, grade and federal state, the day it was made, the day it ends and the id of the build. The cleanup reads the day from it, never from the time of a commit.
:::
```

## gh-pages

The branch Pages serves.

```arc42
:::glossary-term
id: term-gh-pages
title: gh-pages
definition: The branch that GitHub Pages serves at `lernapps.net/practice/`. It holds the site at its root, the previews of submissions below `i/` and the previews of pull requests below `pr-preview/`.
:::
```

## Fingerprint

Why an edit may build nothing.

```arc42
:::glossary-term
id: term-fingerprint
title: Fingerprint
definition: A hash of the ZIP address and the fields, kept in the comment of the last run. The intake stops when the fingerprint is unchanged, unless the run is forced.
:::
```

## Einreichung

German for submission.

```arc42
:::glossary-term
id: term-einreichung
title: Einreichung
definition: The name of the submission workflow, `einreichung.yml`, and of its file in `.github/workflows`.
:::
```

## Aufräumen

German for cleanup.

```arc42
:::glossary-term
id: term-aufraeumen
title: Aufräumen
definition: The name of the cleanup workflow, `aufraeumen.yml`, which removes previews that are over.
:::
```

## Thumbs-up

The 👍 that keeps a preview.

```arc42
:::glossary-term
id: term-keep-reaction
title: Thumbs-up
definition: A 👍 reaction on the first field of the issue by an account that is not a bot. It keeps the preview past its day until the issue is closed.
:::
```

## Family's assistant

Not the creator's assistant.

```arc42
:::glossary-term
id: term-family-assistant
title: Family's assistant
definition: The AI assistant of a family, which writes the content from the family's school material and gives the parent the ZIP file; it reads `llms.txt`.
:::
```
