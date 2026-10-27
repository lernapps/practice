# Runtime View

The scenarios show a submission from form to address, a rejection with its message, a repeated run, the end of a
preview, the preparation by the family's assistant and the publication of the site. In each, the sequence shows which
job holds which rights and what passes between jobs as an artifact. The
[architecture of the whole system](https://lernapps.net/docs/architecture/) shows the same flow from the family's point
of view; here the parts of the block take its place.

## A submission becomes a preview

The parent drags the ZIP file into the form and submits. GitHub starts the submission workflow. The job `intake`
(read rights only) loads the attachment, checks it and unpacks it as data. The job `build` (read rights, no secret)
takes the explainer template at the pinned commit, puts the submitted files in its `src/`, builds, checks the bundle
and marks the pages `noindex`. The job `publish` (write rights, only code of this repository) checks the bundle again,
writes `i/<issue>/` to `gh-pages` as one commit, waits until the address serves the build and comments the link.

```arc42
:::runtime-scenario
id: rs-submission
title: A submission becomes a preview
trigger: A parent submits the form with the ZIP file
involves: bb-form, bb-workflows, bb-workflow-submission, bb-action-validate, bb-action-build, bb-action-publish, bb-lib, bb-previews, bb-app-templates, bb-tooling
:::
```

```arc42
:::diagram
id: rs-submission-sequence
scenario: rs-submission
notation: mermaid-sequence
aliases: parent=actor-adopting-adult, github=actor-github, form=bb-form, flow=bb-workflow-submission, intake=bb-action-validate, build=bb-action-build, publish=bb-action-publish, lib=bb-lib, previews=bb-previews, templates=bb-app-templates, tooling=bb-tooling
:::
```

```mermaid
sequenceDiagram
    participant parent as Parent
    participant github as GitHub
    participant form as Form
    participant flow as Submission workflow
    participant intake as Validate (job intake)
    participant build as Build (job build)
    participant publish as Publish (job publish)
    participant lib as Library
    participant previews as Previews on gh-pages
    participant templates as App templates
    participant tooling as Tooling
    parent->>form: fill in the form, attach the ZIP file
    form->>github: issue with the fields and the attachment link
    github->>flow: event issue opened
    flow->>intake: job with issues read, contents read
    intake->>github: read the issue, load the attachment without a login
    intake->>lib: check the directory, unpack into a throwaway folder
    intake-->>build: artifact intake (data)
    flow->>build: job with contents read, no secret
    build->>templates: take the explainer template at the pinned commit
    build->>build: replace src/, npm ci, npm run build
    build->>tooling: lernapps check on the bundle
    build->>build: mark every page noindex
    build-->>publish: artifact site (data)
    flow->>publish: job with contents write, issues write, pages read
    publish->>lib: check the site again
    publish->>previews: one commit without a parent with i/n/ and practice.json
    publish->>github: wait for the address, update the comment with the link
    github-->>parent: the address of the preview
```

## A rejected submission, with a message

Two things can go wrong, and both end in a comment that the parent hands to the assistant. If the intake finds
problems (a missing declaration, an address that is not an attachment, a path outside `src/`, a file that is too
large), no build starts and publish writes the list of what to change. If the build or the check fails, publish writes
the first lines of the log (file, line, rule) and writes nothing to `gh-pages`. The comment of a failed build carries a
fingerprint of the input, so that an edit that changes neither the ZIP address nor the fields does not build again.

```arc42
:::runtime-scenario
id: rs-rejection
title: A rejected submission, with a message
trigger: The intake finds a problem, or the build or the check of the bundle fails
involves: bb-workflow-submission, bb-action-validate, bb-action-build, bb-action-publish, bb-lib
:::
```

```arc42
:::diagram
id: rs-rejection-sequence
scenario: rs-rejection
notation: mermaid-sequence
aliases: parent=actor-adopting-adult, assistant=actor-family-assistant, github=actor-github, intake=bb-action-validate, build=bb-action-build, publish=bb-action-publish
:::
```

```mermaid
sequenceDiagram
    participant parent as Parent
    participant assistant as Family's assistant
    participant github as GitHub
    participant intake as Validate (job intake)
    participant build as Build (job build)
    participant publish as Publish (job publish)
    github->>intake: issue opened or edited
    alt the intake finds problems
        intake-->>publish: artifact intake with the problems
        Note over build: no build starts
        publish->>github: comment with what to change, in plain German
    else the build or the check fails
        intake-->>build: artifact intake (data)
        build-->>publish: artifact build with the head of the log, no site
        publish->>github: comment with the messages, nothing written to gh-pages
    end
    github-->>parent: the comment
    parent->>assistant: hand over the message
    assistant->>parent: corrected ZIP file
```

## A run is repeated

The parent edits the issue and attaches a corrected ZIP file; GitHub starts the workflow again. The intake compares the
ZIP address and the fields with the fingerprint in the last comment and stops when they are equal, so a changed title
builds nothing. A maintainer can start the workflow by hand with the issue number; that run is forced and builds again
even with an equal input. A new preview replaces the old folder and starts the two weeks again.

```arc42
:::runtime-scenario
id: rs-run-again
title: A run is repeated
trigger: The issue is edited with a new ZIP file, or a maintainer starts the workflow for an issue number
involves: bb-workflow-submission, bb-action-validate, bb-action-build, bb-action-publish, bb-previews
:::
```

```arc42
:::diagram
id: rs-run-again-sequence
scenario: rs-run-again
notation: mermaid-sequence
aliases: parent=actor-adopting-adult, maintainer=actor-practice-maintainer, github=actor-github, flow=bb-workflow-submission, intake=bb-action-validate, build=bb-action-build, publish=bb-action-publish, previews=bb-previews
:::
```

```mermaid
sequenceDiagram
    participant parent as Parent
    participant maintainer as Maintainer
    participant github as GitHub
    participant flow as Submission workflow
    participant intake as Validate (job intake)
    participant build as Build (job build)
    participant publish as Publish (job publish)
    participant previews as Previews on gh-pages
    alt the parent edits the issue
        parent->>github: new ZIP file in the first field
        github->>flow: event issue edited
    else a maintainer repeats the run
        maintainer->>github: Run workflow with the issue number
        github->>flow: workflow_dispatch, forced
    end
    flow->>intake: job intake
    intake->>github: read the issue and the fingerprint of the last comment
    alt the ZIP address and the fields are unchanged and the run is not forced
        Note over build,publish: nothing to do
    else
        intake-->>build: artifact intake (data)
        build-->>publish: artifact site (data)
        publish->>previews: replace i/n/, the two weeks begin again
        publish->>github: update the comment
    end
```

## A preview ends

The cleanup runs every day, when an issue is closed, and by hand. It starts from a fresh copy of `gh-pages`, reads
`practice.json` of each folder `i/<n>/`, asks GitHub for the state of the issue and for thumbs-up reactions from
accounts that are not bots, and removes what is over. When the issue is closed the preview is removed at once and
without a note; after the day in `practice.json` it is removed unless a person gave a thumbs-up, with a short note in the
issue. The result is one new commit without a parent, pushed with a lease; if another writer was faster, the cleanup
starts again on the new state.

```arc42
:::runtime-scenario
id: rs-expiry
title: A preview ends
trigger: The daily schedule, a closed issue or a manual start of the cleanup
involves: bb-workflow-cleanup, bb-action-expire, bb-lib, bb-previews
:::
```

```arc42
:::diagram
id: rs-expiry-sequence
scenario: rs-expiry
notation: mermaid-sequence
aliases: github=actor-github, cleanup=bb-workflow-cleanup, expire=bb-action-expire, lib=bb-lib, previews=bb-previews
:::
```

```mermaid
sequenceDiagram
    participant github as GitHub
    participant cleanup as Cleanup workflow
    participant expire as Expire (job expire)
    participant lib as Library
    participant previews as Previews on gh-pages
    github->>cleanup: schedule, issue closed or manual start
    cleanup->>expire: job with contents write, issues write
    expire->>lib: fresh copy of gh-pages
    lib->>previews: fetch the branch at depth one
    loop each folder i/n/
        expire->>previews: read practice.json
        expire->>github: state of the issue, thumbs-up of persons
        expire->>expire: keep or delete
    end
    expire->>lib: one commit without a parent
    lib->>previews: push with a lease against the state it started from
    expire->>github: short note in the issue of each expired preview
```

## The assistant prepares the content

The family's assistant reads the guide and first looks in the catalog for an app that fits. If none does, it asks for
the subject, the grade, the federal state and the day of the test, reads the photos, agrees the scope with the parent,
reads what the explainer can do, writes the content and gives the parent the ZIP file and the link to the form. The
photos go to the assistant's provider and never into the system.

```arc42
:::runtime-scenario
id: rs-preparation
title: The assistant prepares the content
trigger: A parent tells their assistant to read the guide and to prepare their child for a test
involves: bb-guidance, bb-assistant-guide, bb-assistant-skills, bb-catalog, bb-app-templates
:::
```

```arc42
:::diagram
id: rs-preparation-sequence
scenario: rs-preparation
notation: mermaid-sequence
aliases: parent=actor-adopting-adult, assistant=actor-family-assistant, guide=bb-assistant-guide, skills=bb-assistant-skills, catalog=bb-catalog, templates=bb-app-templates
:::
```

```mermaid
sequenceDiagram
    participant parent as Parent
    participant assistant as Family's assistant
    participant guide as Guide for assistants
    participant skills as Skills for assistants
    participant catalog as Catalog
    participant templates as App templates
    parent->>assistant: read llms.txt and prepare my child for the test
    assistant->>guide: read the steps
    opt the assistant can install skills
        assistant->>skills: install the same steps as skills
    end
    assistant->>parent: subject, grade, federal state, day of the test
    assistant->>catalog: look for an app that fits
    alt an app fits
        catalog-->>assistant: the link, and the work is done
    else none fits
        assistant->>parent: hints on photos and copyright, then the scope to agree
        assistant->>templates: read what the explainer can do and its schemas
        assistant->>parent: the ZIP file and the link to the form
    end
```

## The site is published

A change of the documentation or the build goes through the pages workflow. The shared site action builds the site with
`npm run build` and checks it with `npm run check`; on the main line the site is deployed to the root of `gh-pages`,
and `i/` and `pr-preview/` stay. A pull request from the same repository gets a preview below `pr-preview/`.

```arc42
:::runtime-scenario
id: rs-site-published
title: The site is published
trigger: A change of the pages, the guide or the build reaches the main line, or a pull request is opened
involves: bb-workflow-pages, bb-workflow-pr-preview, bb-site-build, bb-documentation, bb-tooling, bb-website, bb-previews
:::
```

```arc42
:::diagram
id: rs-site-published-sequence
scenario: rs-site-published
notation: mermaid-sequence
aliases: pages=bb-workflow-pages, preview=bb-workflow-pr-preview, build=bb-site-build, docs=bb-documentation, tooling=bb-tooling, frame=bb-website, branch=bb-previews
:::
```

```mermaid
sequenceDiagram
    participant pages as Pages workflow
    participant preview as Pull request preview workflow
    participant tooling as Tooling
    participant build as Site build
    participant docs as Pages for people
    participant frame as Website
    participant branch as Previews on gh-pages
    pages->>tooling: shared site action: build and check
    tooling->>build: npm run build
    build->>docs: render the pages in German and English
    build->>frame: header, footer, language switch
    tooling->>build: npm run check
    pages->>tooling: on the main line: deploy, keep i/
    tooling->>branch: commit of the root, i/ and pr-preview/ stay
    preview->>tooling: for a pull request of the same repository
    tooling->>branch: preview below pr-preview/
```
