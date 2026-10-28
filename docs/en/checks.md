# Checks

A submission goes through three stages. A stage begins only when the one before had no error.

## Stage 1: Intake (job `intake`) {#acceptance}

The job only reads. It runs nothing that is in the ZIP file.

1. The issue comes from the form (all five headings are there) and is open. Otherwise nothing happens.
2. The details match the lists, and the three declarations are ticked.
3. The ZIP address has exactly the form `https://github.com/user-attachments/files/<number>/<name>.zip`. The file is downloaded with `curl -L` (only `https`, at most 5 redirects, 10 MB, 60 seconds). The final address must be at GitHub.
4. The directory of the ZIP file is checked (paths, kinds, endings, sizes, number), then every file is unpacked with a hard size limit and compared with the checksum. The [rules](rules.md) name the limits. `src/main.ts` is never unpacked.
5. The content of every SVG image is checked: it may only draw ([SVG images](rules.md#svg)).

If there is an error, no build starts. Instead the job `publish` writes a comment in plain language.

## Stage 2: Build (job `build`) {#build}

The job has read rights only and no secrets. It builds like this:

1. It fetches `lernapps/app-templates` in exactly the state (commit) with which your assistant created the app: `appTemplates.commit` from the `package.json` of `lernapps/tooling` on `main`, read at build time. If it cannot be read, the build stops with a clear message.
2. It takes the folder `explainer/` as the app and replaces `src/` with your content. The `main.ts` of the template stays. Example components and example chapters are dropped.
3. It installs with `npm ci`, runs the tests of your components (`vp test`, only if there are components) and builds with `npm run build`. The template depends on `file:..` (the parent folder with the runtime). So it installs first in the root folder of `app-templates` (this builds the runtime), then in the folder `explainer/`. Both lock files fix the versions. Then it installs `@lernapps/tooling` at the commit of `main` from which it read the state of the template: the same tooling with which your assistant created and checked the app.
4. It checks the built bundle with `lernapps check _site` (see below).
5. It puts `<meta name="robots" content="noindex">` into every HTML page, so that search engines do not index the preview.

The build of the explainer checks the content and the code of every component: no network (`fetch` and the like), no `eval`, no `innerHTML` and no `v-html`, only allowed imports, browser objects only from `onMounted`, at most 20 kB of own code, a test per component, and for an exercise component the contract with 50 fixed tasks. A violation is in the comment with file, line and rule.

The job runs code of your components (their tests and their logic while building). That is why it has read rights only and no secret. The type check of the components (`vue-tsc`) does not run here; it runs at your assistant with `npm run check`.

## The check of the bundle {#bundle}

`lernapps check <folder>` checks a built bundle without a catalogue entry. For this it opens every page in a browser, as a learner would, and checks these eight rules of the platform:

| Rule | Question |
| --- | --- |
| `accessible` | Is the page accessible (WCAG 2.1 AA)? |
| `usable-at-360px` | Does everything work at 360 px width without scrolling sideways? |
| `no-tracking` | Does the page set no cookies and send no data? |
| `no-request-before-click` | Does the page ask no other server before someone clicks? |
| `own-data-only` | Does the page touch only its own data in the browser? |
| `links-resolve` | Does every link lead to a page or file that exists? |
| `pages-reachable` | Is every page reachable from the start page? |
| `explainer-readable-without-js` | Is the content readable without JavaScript too? |

**Every one of these rules must pass.** We relax none, because they protect children (no tracking) and the shared browser memory of the platform (`own-data-only`). The check takes about 10 seconds.

## What does not apply to a preview {#not-checked}

These rules of the platform apply to the catalogue, not to a temporary preview. We do not check them here:

| Not checked | Reason |
| --- | --- |
| Catalogue entry (`entry-from-schema`, `entry-links-resolve`, `entry-fitness-matches`) | A preview is not in the catalogue. There is no entry to check. |
| `dependency-licence`, `app-content-guide` | Both need the repository of an app. The dependencies are in the lock file of the template. A preview has no content guide of its own. |
| Check of the content (`learners-act`, `learner-text-german`, `third-party-licence`, `no-learner-data-in-texts`) | A person judges this when the content is added to the catalogue. Until then your three declarations apply. |
| Imprint and privacy notice of the app | The pages of the template already link them on `lernapps.net`. A separate check is not needed. |
| Formatting and style of the files | A preview never fails because of spelling (indentation, empty lines). We run no format check and do not reformat your content. Only the rules of the explainer for the content count. |
| Entry in search engines | The preview should not be found. So `noindex` is on every page. |

## Stage 3: Publication (job `publish`) {#publication}

The job runs only code from this repository. It treats the result of the build as data.

1. It checks the site once more: number and size of the files, names, endings, links, `noindex` on every page.
2. It writes it to the branch `gh-pages` in the folder `i/<number>/` and adds `i/<number>/practice.json` ([Lifetime](lifetime.md)).
3. It waits until the address serves the new state and writes the link in the comment.
