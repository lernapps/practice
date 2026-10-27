# A learning app made to measure for an acute occasion

The test is next week, and no app in the catalogue fits. Or a teacher is absent, and the class needs exercises that match the material. Then your AI assistant makes a small learning app to measure in minutes. It is temporary and free. The learners need no account.

The guide for the assistant (llms.txt, skills) is so far written for parents. It leads you and your child through the preparation for a test. The guide and the content of the apps are in German.

## What the platform does for you {#kurz}

- **A fitting solution instead of a long search.** Your assistant first looks in the catalogue. If an app fits there, you are done. Only if nothing fits, a new one is made.
- **Your assistant leads you.** It asks for the subject, the school year and the day of the test. From photos of the material it writes exercises of its own. You confirm the scope with your child.
- **Checked and built.** The platform checks the content and builds the app from it. It reports errors in a way your assistant can fix.
- **Your child practises at once.** It opens the address, without an account and without installation. The app stores nothing about your child.
- **After two weeks it is gone.** Unless it helped and someone says so.

## How it works {#schritte}

1. **Search the catalogue first.** *You:* You notice that no app fits the material. *The platform:* Your assistant searches the [catalogue](https://lernapps.net/apps/) by subject, school year and topic. If an app fits, you get the link and build nothing.
2. **Your assistant leads you through.** *You:* You name the subject, the school year, the federal state and the day of the test. You give it photos of the material and check the list of topics with your child. *The platform:* The guide tells your assistant what to ask, what to write without copying and when to wait for you. The photos go to your assistant only.
3. **Submit and have it checked.** *You:* You submit the content as a ZIP file with a form. *The platform:* GitHub checks the content and builds the app. If something is missing, it says so in a comment, and your assistant corrects it. [Submit: step by step](einreichen.md) explains every move.
4. **Hand over the app.** *You:* You give the address to your child or the class. *The platform:* It writes the address in a comment.
5. **Practise.** *Your child:* It does the self-check, solves the exercises and follows the training plan. The child counts the self-check alone. *The platform:* It remembers nothing about the child.
6. **What proves itself.** *You:* If the app helped, you put a 👍 on the first field of the issue. *The platform:* Then the app stays, and we check whether the content fits into the catalogue. Without a 👍 it is deleted ([Lifetime](lebensdauer.md)).

## Start with the assistant {#assistent}

Copy this sentence into the conversation with your AI assistant and replace `<subject>`:

```text
Read https://lernapps.net/practice/llms.txt and help me prepare my child for the test in <subject>.
```

The guide for the assistant is [llms.txt](llms.txt). It is written in German, and so is the content of the apps. The assistant asks you for the subject, the school year, the federal state and the day of the test.

## Good to know {#wissen}

- **GitHub account:** To submit, you need a GitHub account. It is free and needs only an email address. Children under 13 do not create it themselves, their parents do. What GitHub is and how to get an account is explained in [GitHub, explained](https://lernapps.net/tooling/en/github/). The child itself needs no account.
- **Privacy:** The form, the ZIP file and the app are public. So the content contains no names, no school and no photos. More in [Privacy and copyright](datenschutz.md).
- **Two weeks:** After that the app is deleted. How to keep it longer is described in [Lifetime](lebensdauer.md).

## Where next? {#weiter}

| I want to … | Page |
| --- | --- |
| submit a preparation | [Submit: step by step](einreichen.md) |
| know what the ZIP file may contain | [Rules for content and details](regeln.md) |
| know what happens to the data and who owns the content | [Privacy and copyright](datenschutz.md) |
| know how long an app stays | [Lifetime](lebensdauer.md) |
| prepare a submission as an AI assistant | [llms.txt](llms.txt) |

## For maintainers {#maintainer}

- [Operations](betrieb.md): what the repository is for, how it runs and how to find faults.
- [Checks](pruefungen.md): what is checked in a submission.
- [Testing the guide](anleitung-testen.md): how to test the guide for assistants and build locally.
- **Installing the skills**: The guide is made of three skills in `skills/`. A skill installer reads them from the repo: `npx --yes skills add lernapps/practice -y -s lernapps-practice` (likewise `-s lernapps-practice-photos` and `-s lernapps-practice-explainer`). The entry point for every assistant stays [llms.txt](llms.txt); it holds all three skills in one document and is made with `npm run llms`.
- [Architecture](architecture/): how the repository is built (arc42).
