# Privacy and copyright

## What is stored {#gespeichert}

| What | Where | How long |
| --- | --- | --- |
| Your issue (subject, school year, federal state, link to the ZIP file, comments) | GitHub, publicly visible | until the issue is deleted |
| The ZIP file | GitHub (attachment of the issue; the link is public) | like the issue |
| The built preview | Branch `gh-pages` of this repository, public at `lernapps.net/practice/i/<number>/` | two weeks, or longer with 👍 (see [Lifetime](lebensdauer.md)) |
| Intermediate results of a run (artifacts) | GitHub Actions | 3 days |
| `practice.json` of the preview (subject, school year, federal state, date) | in the folder of the preview | like the preview |

**Everything here is public.** So submit nothing that must not be public.

## Personal data does not belong in the content {#persoenliche-daten}

The content contains no names, no school, no class, no teacher and no photos of children. You declare this in the form (second declaration). The field "Fach" (subject) belongs to the issue and is public as well; write only the subject there.

The issue itself is public too. Write nothing personal in it. The comments of the program do not repeat details from the form.

## The app stores nothing about the child {#lernstand}

The preview sends nothing to a server and sets no cookies. The build checks this with the rules `no-tracking` and `no-request-before-click` ([Checks](pruefungen.md)). The app stores nothing about the child: no answers, no learning progress, no points. The page counts answers only in working memory while it is open; after a reload, or on another device, the child starts again. The child counts the self-check alone. The template's tests check this: after practising, nothing is in the browser's storage (the build of a single preview does not run these tests). The template can remember only two choices on the device, and only when a content offers them: an AI tutor and “always load videos directly”. The guide for assistants leaves both out.

The preview is on the same domain as other apps of the platform. So the rule `own-data-only` allows each app access only to its own keys in the browser memory.

## Copyright {#urheberrecht}

- You submit only content **made by yourself** (also with AI help). Copy nothing from books, worksheets or other sources, and add no photos of material. You declare this in the form (first declaration).
- You allow the content to be published for **two weeks** (third declaration).
- If the content is later added to the **catalogue**, the licence **CC BY 4.0** applies, and you are the author. This means: others may use and change the content if they name you.
- You name sources for facts in the content (`sources` in `src/app.yaml`).

## Deleting {#loeschen}

- We delete the preview after two weeks, or at once when you close the issue.
- Every change to the previews replaces the branch `gh-pages` with one single new commit without a predecessor. So deleted previews do not stay in an old state there. GitHub may keep unreachable states internally for a while; we cannot influence that.
- You delete the issue and the ZIP file yourself (delete the issue, or ask us). If you have questions, write a comment in your issue.
