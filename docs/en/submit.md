# Submit: step by step

## Before you start {#before}

1. Your assistant has built and checked the learning app of the archetype `explainer` on your computer. It gives you the ZIP file with the folder `src` (pages, images, components).
2. You know what you confirm: your assistant has shown you every page of the app before it gives you the ZIP file.
3. The content meets the [rules](rules.md). The most important: no names, no copied texts, no photos of the material.
4. You have a GitHub account.

## How to pack the ZIP file {#pack-zip}

Pack the **folder `src` itself**. Then `src/app.yaml` is at the top of the ZIP file. The ZIP file may be at most 10 MB.

It also works if you download the whole project from GitHub as a ZIP file ("Download ZIP"). Then everything is in one folder such as `my-project-main/`. We read only `my-project-main/src/` from it. We ignore everything else and never unpack it.

## How to submit {#submit}

1. Open the form: <https://github.com/lernapps/practice/issues/new?template=submit.yml>
2. Fill in **Fach** (subject), **Klassenstufe** (school year) and **Bundesland** (federal state).
3. Drag the ZIP file into the field **ZIP-Datei**. Wait until a link such as `[name.zip](https://github.com/user-attachments/files/…/name.zip)` appears there.
4. Tick the **three declarations**.
5. Click **Submit new issue**.

After about one to three minutes GitHub writes a comment:

- **All good:** You get the address of the preview, for example `https://lernapps.net/practice/i/12/`.
- **Something is missing or wrong:** The comment says what, in plain words. Give it to your assistant.
- **Error while building:** The comment shows the messages of the build (file, line, rule). Give them to your assistant, who corrects the content.

The form and the comments are in German.

## After a correction {#correction}

A new version goes online with a comment: drag the new ZIP file into the comment box of your issue, wait for the link and click **Comment**. GitHub then checks and builds again and replaces the preview and its old comment. The ZIP file attached last always counts. Only your own comments count, not those of others.

You change a detail of the form (subject, school year, state) at the first field: the three dots, then **Edit**. If the ZIP file and the details stay the same, GitHub does not build again.

## Pre-fill the form {#prefill}

The form can be pre-filled with parameters in the address. This helps assistants that give you a ready link. The names of the parameters are the identifiers (ids) of the fields:

| Parameter | Field | Example value |
| --- | --- | --- |
| `template` | always `submit.yml` | `submit.yml` |
| `title` | title of the issue | `Vorbereitung: Religion` |
| `subject` | subject | `Religion` |
| `grade` | school year (a number from 1 to 13) | `7` |
| `federalState` | federal state (exactly as in the list) | `Hessen` |

Example:

```text
https://github.com/lernapps/practice/issues/new?template=submit.yml&title=Vorbereitung%3A%20Religion&subject=Religion&grade=7&federalState=Hessen
```

Special characters must be rewritten in the address: a space as `%20`, ü as `%C3%BC` (for example `Baden-W%C3%BCrttemberg`). You cannot pre-fill the ZIP file and the declarations. You must tick the declarations yourself.

## If something does not work {#problems}

- **No comment after five minutes:** Open the tab "Actions" of the repository and look for the run "Submission". Write us a comment in the issue.
- **"Kein ZIP gefunden" (no ZIP found):** The ZIP file did not arrive. Attach it as a comment and wait for the link before you click **Comment**.
- **The page does not load yet:** GitHub sometimes needs a few minutes until the address answers. Try again later.
