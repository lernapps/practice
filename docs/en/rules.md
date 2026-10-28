# Rules for content and details

## What you submit {#content}

The content of a learning app of the archetype **`explainer`**: chapters with pages, explanations and exercises as YAML files, plus data files, images and components. The files are described in the [schema of the explainer](https://github.com/lernapps/app-templates/blob/main/runtime/explainer/explainer.v1.schema.json) and in the [guide to the archetype](https://github.com/lernapps/app-templates/tree/main/explainer). There is no textbook for it: you submit your own content.

## Structure of the ZIP file {#structure}

- The folder `src` is at the top of the ZIP file. The file `src/app.yaml` must be there.
- A folder around everything also works (GitHub "Download ZIP"). Then only `<folder>/src/` counts.
- What lies outside `src` we ignore and never unpack.
- We change nothing in the template. `src/main.ts` belongs to it: if the file is in the ZIP file, we ignore it, and the build takes the template's.
- Your own components are in `src/components/`, as the explainer knows them: `<Name>.vue`, `<Name>.ts` and `<Name>.test.ts`, without subfolders. The build checks their code (see [Checks](checks.md#build)).
- Data files are in `src/data/`, images in `src/images/`.

## Allowed files {#files}

| Rule | Value |
| --- | --- |
| Endings | `.yaml`, `.yml`, `.md`, `.png`, `.jpg`, `.webp` |
| Components | `.vue` and `.ts` only in `src/components/`; names like `NumberLine.vue`, `NumberLine.ts`, `NumberLine.test.ts` |
| SVG images | `.svg` only in `src/images/`, names of lower-case letters, digits and hyphens (see [SVG images](#svg)) |
| Not allowed | everything else, for example `.js`, `.html`, `.json` |
| Names | only `a-z`, `A-Z`, `0-9`, `-` and `_`; exactly one dot before the ending (no `image.png.js`) |
| Hidden files | not allowed (names that start with a dot, for example `.DS_Store`) |
| Paths | only folders below `src/`, at most 6 folders deep; no `..`, no absolute path, no backslash |
| Links and special files | not allowed (symlinks, devices); encrypted files not allowed |
| ZIP file | at most 10 MB |
| Number | at most 300 files below `src` |
| Size unpacked | at most 25 MB in total, at most 10 MB per file |
| Time limit for the download | 60 seconds |

We check the sizes in the directory of the ZIP file **and** while unpacking. A ZIP file that states wrong sizes is rejected. Umlauts in file names are not allowed; in the text of the YAML files they are of course allowed.

## The details in the form {#details}

| Field | Rule |
| --- | --- |
| Fach (subject) | Required, at most 60 characters, one line. We remove control characters. |
| Klassenstufe (school year) | a number from 1 to 13 from the list |
| Bundesland (federal state) | one of the 16 federal states from the list |
| ZIP-Datei | a link `https://github.com/user-attachments/files/<number>/<name>.zip` that GitHub writes when you drag the file in. We load no other addresses. |
| Erklärungen (declarations) | all three ticked |

## The three declarations {#declarations}

1. The content is made by yourself (also with AI help). Nothing is copied from books or worksheets, and it contains no photos of material.
2. The content contains no personal data (names, school, class, teacher).
3. I allow the content to be published for two weeks. If it is later added to the catalogue, CC BY 4.0 applies, and I am the author.

More on this: [Privacy and copyright](privacy.md).

## Content that always applies {#always}

- Texts for learners are in German and in plain language.
- Examples use invented names, never real ones.
- Sources go in the field `sources` of `src/app.yaml` if you take over facts.
- The YAML rules of the explainer are strict. A colon or a comma in the text without quotation marks leads to an error. The comment then shows you the line.
