# Lifetime of a preview

A preview lives **two weeks** (14 days). After that it is deleted automatically, unless a person has saved it with a 👍.

## The rules {#regeln}

| Situation | What happens |
| --- | --- |
| The issue is **closed** | The preview is deleted **at once**. There is no comment, because someone closed the issue on purpose. |
| The expiry day has not come | The preview stays. |
| The expiry day has come, and the **first field of the issue** has at least one 👍 from a **person** (not from a bot) | The preview **stays** until the issue is closed. We check whether the content fits into the catalogue. |
| The expiry day has come, no 👍 | The preview is deleted. A comment in the issue says so, mentions you (`@your-name`) and asks whether the preview helped. |

The expiry day is in `i/<number>/practice.json` (field `laeuftAb`). This date counts, **not** the time of a commit.

## Publish again {#neu-veroeffentlichen}

Every new publication for the same issue replaces the old one and starts the two weeks again. This happens when you attach a new ZIP file as a comment or change the details in the issue. After a preview has expired it works the same way: attach a new ZIP file as a comment.

A maintenance team can also repeat the run without attaching again ([Operations](betrieb.md)).

## When the clean-up runs {#aufraeumen}

The workflow "Aufräumen" (clean-up) runs

- **daily** at 03:23 UTC (checks all folders),
- **at once** when an issue is closed (checks its folder),
- **by hand** (with the option "dry-run", which only shows what would be deleted).

## Folders without a matching issue {#ohne-issue}

The workflow looks only at folders `i/<number>/` on `gh-pages`. Everything else (for example the start page and `.nojekyll`) stays untouched, and so do entries of `i/` whose name is not a number.

- **Folder without a readable `practice.json`**, or with one for another issue: is **deleted at once**. The program writes the files and the `practice.json` in one single commit. So such a folder does not come from this process.
- **Folder whose issue no longer exists** (deleted or moved): stays until the expiry day in `practice.json` and is then deleted without a comment. A 👍 can no longer exist.
- **Issue with a 👍, but closed**: is deleted. Closing always ends the preview.
