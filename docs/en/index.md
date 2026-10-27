# Practise for a test: temporary previews

Parents and pupils can have the content of a learning app they made themselves tried out here, for example for a class test. GitHub builds a preview with its own address from the content. The preview stays for two weeks and is then deleted.

## The key points {#kurz}

- An AI assistant turns photos of school material into the **content** of a small learning app: a self-check, exercises and a training plan.
- You submit the content as a **ZIP file** with a **form**. You need a GitHub account for this.
- GitHub **checks** the content, **builds** the app and writes the **address** in a comment for you.
- The preview **disappears after two weeks**, unless someone puts a 👍 on the first field of the issue. Then we check whether the content fits into the catalogue.
- Your child's **learning progress** stays in your child's browser. It is never part of the content.

## Five steps {#schritte}

1. Tell your assistant which subject and which test you practise for (box below).
2. Give it photos of the material and check the list of topics with your child.
3. The assistant creates the ZIP file with the content.
4. Open the [form](https://github.com/lernapps/practice/issues/new?template=einreichen.yml), drag the ZIP file into it and send it.
5. After a few minutes the address of the preview appears in a comment. Open it with your child.

Every step is explained in [Submit: step by step](einreichen.md).

## Start with the assistant {#assistent}

Copy this sentence into the conversation with your AI assistant and replace `<subject>`:

```text
Read https://lernapps.net/practice/llms.txt and help me prepare my child for the test in <subject>.
```

The guide for the assistant is [llms.txt](llms.txt). It is written in German, and so is the content of the apps. The assistant asks you for the subject, the school year, the federal state and the day of the test.

## Good to know {#wissen}

- **GitHub account:** The account is free and needs only an email address. Children under 13 do not create it themselves, their parents do. What GitHub is and how to get an account is explained in [GitHub, explained](https://lernapps.net/tooling/en/github/).
- **Privacy:** The form, the ZIP file and the preview are public. So the content contains no names, no school and no photos. More in [Privacy and copyright](datenschutz.md).
- **Two weeks:** After that the preview is deleted. How to keep it longer is described in [Lifetime](lebensdauer.md).
- **Form:** [Go to the form](https://github.com/lernapps/practice/issues/new?template=einreichen.yml)

## Where next? {#weiter}

| I want to … | Page |
| --- | --- |
| submit a preparation | [Submit: step by step](einreichen.md) |
| know what the ZIP file may contain | [Rules for content and details](regeln.md) |
| know what happens to the data and who owns the content | [Privacy and copyright](datenschutz.md) |
| know how long a preview stays | [Lifetime](lebensdauer.md) |
| prepare a submission as an AI assistant | [llms.txt](llms.txt) |

## For maintainers {#maintainer}

- [Operations](betrieb.md): what the repository is for, how it runs and how to find faults.
- [Checks](pruefungen.md): what is checked in a submission.
- [Architecture](architecture/): how the repository is built (arc42).
