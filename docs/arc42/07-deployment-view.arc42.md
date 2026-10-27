# Deployment View

Practice has no server of its own. Its source is one repository on GitHub, its logic runs on GitHub-hosted runners, and
what it produces is static files on the branch `gh-pages`, which GitHub Pages serves under `lernapps.net/practice/`.
The [architecture of the whole system](https://lernapps.net/docs/architecture/) shows the same address as one node of
the platform; this chapter shows what is behind it.

## Deployment overview

```arc42
:::diagram
id: deployment-overview
view: deployment
notation: mermaid-architecture
aliases: env_github=env-github, dn_issues=dn-issues, dn_repository=dn-repository, dn_runner=dn-runner, dn_pages_practice=dn-pages-practice, bb_form=bb-form, bb_workflows=bb-workflow-submission, bb_actions=bb-action-build, bb_lib=bb-lib, bb_site_build=bb-site-build, bb_previews=bb-previews, bb_guidance=bb-documentation
:::
```

```mermaid
architecture-beta
    group env_github(cloud)[GitHub]
    group dn_issues(server)[Issues] in env_github
    group dn_repository(disk)[Repository] in env_github
    group dn_runner(server)[Runner] in env_github
    group dn_pages_practice(internet)[lernapps net practice] in env_github
    service bb_form(internet)[Form] in dn_issues
    service bb_workflows(disk)[Workflows] in dn_repository
    service bb_actions(server)[Actions] in dn_runner
    service bb_lib(server)[Library] in dn_runner
    service bb_site_build(server)[Site build] in dn_runner
    service bb_previews(disk)[Previews] in dn_pages_practice
    service bb_guidance(internet)[Guidance] in dn_pages_practice
    bb_form:B --> T:bb_workflows
    bb_workflows:B --> T:bb_actions
    bb_actions:R --> L:bb_previews
```

## GitHub

Everything runs on GitHub (`con-github`): there is no other environment, and the settings that matter are Issues
switched on, Pages served from the branch `gh-pages` at its root, the checks `check` and `site` required on the main
line, and Actions allowed. The workflows set their own rights, so the general setting for workflow permissions needs no
change.

```arc42
:::deployment-node
id: env-github
title: GitHub
type: environment
:::
```

### Issues

The form is served by GitHub as the issue form of the repository. The ZIP files stay as attachments of the issues, with
a public link; the intake loads them from there.

```arc42
:::deployment-node
id: dn-issues
title: Issues of the repository
type: server
parent: env-github
hosts: bb-form
:::
```

### Repository

The main line holds the source of every block and the workflows. The pins of other repositories (actions by commit,
the template by `appTemplates.commit`) are in these files.

```arc42
:::deployment-node
id: dn-repository
title: Repository lernapps/practice
type: server
parent: env-github
hosts: bb-workflow-submission, bb-workflow-cleanup, bb-workflow-pages, bb-workflow-pr-preview, bb-workflow-check
:::
```

### Runner

Each job runs on a GitHub-hosted Linux runner with Node.js 22 and is gone afterwards. The job `build` also checks out
the template into `_templates/` and caches the browser of the check. Artifacts between jobs are kept for three days.
The runners are the only place where submitted files are unpacked and built.

```arc42
:::deployment-node
id: dn-runner
title: GitHub-hosted runner
type: container
parent: env-github
hosts: bb-action-validate, bb-action-build, bb-action-publish, bb-action-expire, bb-lib, bb-site-build
:::
```

### lernapps.net/practice

GitHub Pages serves the branch `gh-pages` under this address. It holds three parts side by side, and each has one
writer:

| Path on `gh-pages` | Content | Written by |
|---|---|---|
| root | the site: pages, `llms.txt`, 404 page | the pages workflow; the placeholder `index.html` is made only when there is no site |
| `i/<issue number>/` | one preview and its `practice.json` | publish and expire |
| `pr-preview/pr-<number>/` | the preview of a pull request | the pull request preview workflow |

The pages workflow leaves `i/` and `pr-preview/` standing. Publish and expire write one commit at a time, in the group
`gh-pages`; a pull request preview has a group of its own, and a push that loses against another push is repeated.

```arc42
:::deployment-node
id: dn-pages-practice
title: lernapps.net/practice
type: server
parent: env-github
hosts: bb-previews, bb-assistant-guide, bb-documentation
:::
```

### Neighbouring repositories

The repositories and sites of the neighbours, which are black boxes here. The template and the tooling are taken at a
commit; the frame is installed from git at a commit; the catalog is only linked.

```arc42
:::deployment-node
id: dn-neighbours
title: Repositories and sites of the neighbours
type: server
parent: env-github
hosts: bb-app-templates, bb-tooling, bb-website, bb-catalog
:::
```
