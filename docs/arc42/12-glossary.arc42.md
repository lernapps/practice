# Glossary

## Submission

Not a pull request: the issue itself.

```arc42
:::glossary-term
id: term-submission
title: Submission
definition: A GitHub issue made from the form, with the content attached as a ZIP file. Its number names the preview.
:::
```

## Preview

Not an app in the catalog: it ends.

```arc42
:::glossary-term
id: term-preview
title: Preview
definition: The temporary app built from a submission, served at `lernapps.net/practice/i/<issue number>/`.
:::
```

## Content

Data for the explainer, never code.

```arc42
:::glossary-term
id: term-content
title: Content
definition: The YAML, Markdown and image files below `src/` of a submission.
:::
```

## Explainer

One archetype of the app templates.

```arc42
:::glossary-term
id: term-explainer
title: Explainer
definition: The archetype that builds pages of content with an exercise on each page. Every preview is an explainer.
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
definition: A file set that one job of a workflow hands to the next. Only the build runs code from it, the submitted components, without rights; the other jobs treat it as data.
:::
```

## Practice record

`practice.json`.

```arc42
:::glossary-term
id: term-practice-record
title: Practice record
definition: The file beside a preview that tells the cleanup when the preview ends. The cleanup reads the day from it, never from the time of a commit.
:::
```

## gh-pages

The branch Pages serves.

```arc42
:::glossary-term
id: term-gh-pages
title: gh-pages
definition: The branch that GitHub Pages serves at `lernapps.net/practice/`, in three parts (chapter 7).
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

## Latest upload

Which ZIP file a run takes.

```arc42
:::glossary-term
id: term-latest-upload
title: Latest upload
definition: Of the ZIP files in the field of the form and in the comments of the issue's author, the one uploaded last. GitHub numbers attachments in ascending order, so the largest number wins. Comments of anybody else never count.
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

## Creator's assistant

Not the platform's assistant.

```arc42
:::glossary-term
id: term-ai-assistant
title: Creator's assistant
definition: The AI assistant of a creator, with a shell, which builds the app from the school material; it reads `llms.txt` and follows the plan template.
:::
```
