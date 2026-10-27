# Operations

For people who maintain the repository.

## What this repository is for {#zweck}

The repository `lernapps/practice` contains only the documentation, the form and the processes (workflows). It contains no apps and no runtime. The app is built anew for every submission from your content and the template `explainer` from [lernapps/app-templates](https://github.com/lernapps/app-templates).

A build in the browser is not possible, because the build tools need native programs. So GitHub builds. And because a pull request from a fork would get no preview, we use an issue and not a pull request.

## Building blocks {#bausteine}

| Part | Task |
| --- | --- |
| `.github/ISSUE_TEMPLATE/einreichen.yml` | The form. The ids `fach`, `klassenstufe`, `bundesland`, `zip`, `erklaerungen` and the lists are fixed. `actions/lib/limits.ts` knows the same lists; a test compares them. |
| `.github/workflows/einreichung.yml` | Three jobs for a submission: `intake`, `build`, `publish`. |
| `.github/workflows/aufraeumen.yml` | Deletes previews that are over. |
| `.github/workflows/check.yml` | Tests the scripts (`npm test`) and the workflows (actionlint). |
| `.github/workflows/pages.yml` | Builds and checks this site and publishes it to `gh-pages` (see [The site](#seite)). The required check is called `site`. |
| `.github/workflows/pr-preview.yml` | A preview of this site for every pull request. |
| `docs/*.md`, `docs/en/*.md`, `scripts/`, `site/` | The texts (German and English), the build script and the style of this site. |
| `docs/arc42/` | The architecture of this repository as an arc42 model, in English only. The build script validates it with `arc42 validate --strict` and publishes it as [Architecture](architecture/). |
| `actions/validate`, `build`, `publish`, `expire` | Local composite actions with the logic. Each has an `action.yml` and a script in TypeScript without dependencies. |
| `actions/lib/` | Shared code: read and check the ZIP file, read the form, GitHub calls, the branch `gh-pages`. |
| `package.json` | Contains `appTemplates.commit`, the state of the templates. It is the same as in the tooling (`lernapps/tooling`, `package.json`). |

## The site {#seite}

This site (`https://lernapps.net/practice/`) is built from `docs/*.md` (German) and `docs/en/*.md` (English, same file names and same heading anchors). `npm ci && npm run build && npm run check` builds it into `_site/` and checks it, as for the other sites of lernapps.net. A heading of a page may end with `{#anchor}`. A link to another page is written as the file name in the text (`regeln.md#angaben`) and becomes the address in the same language. `docs/llms.txt` is the guide for assistants and is delivered unchanged as `llms.txt`.

Three things lie side by side on the branch `gh-pages`:

| Place | Who writes | Who leaves it alone |
| --- | --- | --- |
| Root (the site) | `pages.yml` (action `site-deploy`) | `einreichung.yml` and `aufraeumen.yml` never touch it. The placeholder `index.html` is made only when there is no page. |
| `i/<number>/` (submissions) | `einreichung.yml`, `aufraeumen.yml` | `pages.yml` leaves `i/` (`keep: i/`). |
| `pr-preview/pr-<number>/` (preview per pull request) | `pr-preview.yml` | `pages.yml` leaves the folder (the action always does). The submissions never touch it. |

Submission, clean-up and the publication of the site write one after the other (group `gh-pages`). The preview per pull request has its own group. If two writers collide, a push fails; repeating the run then helps. A test (`test/site-on-gh-pages.test.ts`) checks that publishing and clean-up do not change the site and `pr-preview/`.

## The jobs with their rights {#jobs}

| Job | Rights | It may … |
| --- | --- | --- |
| `intake` | `issues: read`, `contents: read` | read the issue, download the ZIP file, check it, unpack it. It writes nothing to GitHub. |
| `build` | `contents: read`, no secrets | build and check. It can change neither issues nor branches. |
| `publish` | `contents: write`, `issues: write`, `pages: read` | write `gh-pages` and comment. It runs only code from this repository. |

Text from the issue is never in a `run:` step. It passes only through files or environment variables, and the scripts check it strictly (for example the issue number against `^[1-9][0-9]{0,8}$`). All actions from third parties are pinned to a commit.

The runs for one issue cancel each other (`concurrency` per issue). Writing to `gh-pages` runs in the group `gh-pages`, the clean-up too. GitHub keeps at most one running and one waiting run in a group. If more arrive, the oldest waiting one is dropped. Then a repetition helps (see below). If someone writes to `gh-pages` between reading and writing, the write fails (`--force-with-lease`) and is repeated up to five times on the new state.

## Repeat a run (workflow_dispatch) {#wiederholen}

Whoever has write access can repeat the run for an existing issue without attaching the ZIP file again:

1. In the repository open "Actions" and choose "Einreichung".
2. Click "Run workflow" and enter the number of the issue (`issue`).

A repetition always builds again, even if the ZIP address and details are the same. The clean-up can be started by hand in the same way. By default it is a dry run: it shows in the summary what it would delete and changes nothing. With `dry-run` off it really deletes; with `issue` it affects only one issue.

## Settings in the repository (administrators only) {#einstellungen}

- **Issues** switched on.
- **Pages**: source "Deploy from a branch", branch `gh-pages`, folder `/ (root)`. The branch is created by the first run of "Aufräumen" (without `dry-run`) or by the first publication. Only then can it be selected.
- **Required checks** on `main`: `check` (check.yml) and `site` (pages.yml). Both always run and report the result.
- **Address**: For a repository of the organisation `lernapps`, Pages serves `https://lernapps.net/practice/`. This depends on the domain of the organisation (`lernapps.github.io`), not on this repository.
- **Actions**: allowed; "Workflow permissions" need not be "Read and write", the workflows set their rights themselves.
- **Reactions**: The rule "👍 keeps the preview" applies to reactions on the issue (the first field), not on comments.

## Updates {#updates}

- Renovate (preset from `lernapps/tooling`) raises the pinned commits of the actions, also those of the shared actions for the site (`site-check`, `site-deploy`, `site-preview`), the frame `@lernapps/site` and `marked`.
- `appTemplates.commit` in `package.json` is raised by hand, together with the tooling: take the commit from `lernapps/tooling/package.json`, then check a run for a test issue.

## Abuse and limits {#missbrauch}

Any GitHub account can create an issue and so start a run. Only the set of limits protects against this: small files, short runs, separated rights. Whoever maintains the repository closes or locks issues that are obviously nonsense. Closed issues lose their preview at once.

## Finding faults {#fehler}

| Symptom | Cause |
| --- | --- |
| No comment, run "Einreichung" green | The issue does not come from the form (a heading is missing), or the ZIP address and details are the same as at the last run. The log of `intake` says so. |
| `publish` red: "cannot push gh-pages" | Several runs at the same time. Repeat. |
| Comment "Falls die Seite noch nicht lädt" (if the page does not load yet) | Pages has not delivered the state yet. Usually there after a few minutes. Check the Pages setting. |
| `build` red at `npm ci` | The lock file of the template does not match the state. Check `appTemplates.commit`. |
