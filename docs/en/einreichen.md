# Submit: step by step

## Before you start {#vorher}

1. Your assistant has created the learning app of the archetype `explainer`. You have the folder `src` with the content (YAML files and images).
2. The content meets the [rules](regeln.md). The most important: no names, no copied texts, no program code.
3. You have a GitHub account.

## How to pack the ZIP file {#zip-packen}

Pack the **folder `src` itself**. Then `src/app.yaml` is at the top of the ZIP file. The ZIP file may be at most 10 MB.

It also works if you download the whole project from GitHub as a ZIP file ("Download ZIP"). Then everything is in one folder such as `my-project-main/`. We read only `my-project-main/src/` from it. We ignore everything else and never unpack it.

## How to submit {#einreichen}

1. Open the form: <https://github.com/lernapps/practice/issues/new?template=einreichen.yml>
2. Fill in **Fach** (subject), **Klassenstufe** (school year) and **Bundesland** (federal state).
3. Drag the ZIP file into the field **ZIP-Datei**. Wait until a link such as `[name.zip](https://github.com/user-attachments/files/…/name.zip)` appears there.
4. Tick the **three declarations**.
5. Click **Submit new issue**.

After about one to three minutes GitHub writes a comment:

- **All good:** You get the address of the preview, for example `https://lernapps.net/practice/i/12/`.
- **Something is missing or wrong:** The comment says what, in plain words. Give it to your assistant.
- **Error while building:** The comment shows the messages of the build (file, line, rule). Give them to your assistant, who corrects the content.

The form and the comments are in German.

## After a correction {#korrektur}

Open your issue, click the three dots at the first field and then **Edit**. Drag the new ZIP file into the field **ZIP-Datei** and save. GitHub then checks and builds again. The old comment is replaced.

If you change something else only (for example the title) and the ZIP address and the three details stay the same, GitHub does not build again. The comment stays as it is.

## Pre-fill the form {#vorausfuellen}

The form can be pre-filled with parameters in the address. This helps assistants that give you a ready link. The names of the parameters are the identifiers (ids) of the fields:

| Parameter | Field | Example value |
| --- | --- | --- |
| `template` | always `einreichen.yml` | `einreichen.yml` |
| `title` | title of the issue | `Vorbereitung: Religion` |
| `fach` | subject | `Religion` |
| `klassenstufe` | school year (a number from 1 to 13) | `7` |
| `bundesland` | federal state (exactly as in the list) | `Hessen` |

Example:

```text
https://github.com/lernapps/practice/issues/new?template=einreichen.yml&title=Vorbereitung%3A%20Religion&fach=Religion&klassenstufe=7&bundesland=Hessen
```

Special characters must be rewritten in the address: a space as `%20`, ü as `%C3%BC` (for example `Baden-W%C3%BCrttemberg`). You cannot pre-fill the ZIP file and the declarations. You must tick the declarations yourself.

## If something does not work {#probleme}

- **No comment after five minutes:** Open the tab "Actions" of the repository and look for the run "Einreichung". Write us a comment in the issue.
- **"Kein ZIP gefunden" (no ZIP found):** The ZIP file did not arrive in the field "ZIP-Datei". Drag it in again and wait for the link.
- **The page does not load yet:** GitHub sometimes needs a few minutes until the address answers. Try again later.
