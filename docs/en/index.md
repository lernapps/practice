# A learning app made to measure

The test is next week, and no app in the catalogue fits. Or a teacher is absent, and the class needs exercises that match the material. Then your AI assistant makes a small learning app to measure in minutes. It is temporary and free. The learners need no account.

The guide for the assistant (llms.txt, skills) is so far written for parents. It leads you and your child through the preparation for a test. The guide and the content of the apps are in German.

## How it works {#schritte}

<ol class="flow">
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Your assistant</span>
    <h3>Your assistant searches the catalogue</h3>
    <p>Maybe someone else has already built something that fits? Then you just use the app. Free, no sign-up. As always.</p>
  </li>
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Your assistant</span>
    <h3>Your assistant leads you</h3>
    <p>It reads the photos of the material and writes exercises of its own. You confirm the scope with your child.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">You</span>
    <h3>You submit the content</h3>
    <p>You send it with a form. That creates an issue, a public report in our repository on GitHub.</p>
  </li>
  <li class="flow-step" data-who="platform">
    <span class="flow-who">The platform</span>
    <h3>The platform checks and builds</h3>
    <p>It builds the app and writes the address in a comment. If something is missing, it says so, and your assistant corrects it.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">You & your child</span>
    <h3>You open the address and practise</h3>
    <p>Give it to your child or the class. They need no account and no installation.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">You</span>
    <h3>What helped is kept by a 👍</h3>
    <p>Put it on the first field of the issue. Then the app stays, and we check whether it fits into the catalogue.</p>
  </li>
</ol>

The app stores nothing about your child. The child counts the self-check alone. After two weeks the app is gone, unless a 👍 keeps it ([Lifetime](lebensdauer.md)). [Submit: step by step](einreichen.md) explains every move of the submission. The journey in the platform design is [A tailor-made app for an acute occasion](https://lernapps.net/docs/en/#x-tailor-made-app-h).

## Start with the assistant {#assistent}

Copy this sentence into the conversation with your AI assistant and replace `<subject>`:

```text
Read https://lernapps.net/practice/llms.txt and help me prepare my child for the test in <subject>.
```

The guide for the assistant is [llms.txt](llms.txt). It is written in German, and so is the content of the apps. The assistant asks you for the subject, the school year and the federal state.

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
