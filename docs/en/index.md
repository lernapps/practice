# A learning app made to measure

Your child has a test next week, and you want to practise exactly what will come up. Or you are covering a class for an absent teacher and need exercises on what they are working on right now. For occasions like these, there is rarely a ready-made app that fits.

This is where it comes into being. With your AI assistant and our guide, you turn the material you already have into a learning app made to measure, with little effort. You can use it, for example, to

- prepare your child for a test,
- give a class exercises for a cover lesson,
- find out where a class stands when you cover for a teacher,
- catch up on missed lessons.

The app is free and runs in the browser. Whoever practises with it needs neither an account nor an installation.

## How it works {#steps}

<ol class="flow">
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Your assistant</span>
    <h3>Maybe it already exists</h3>
    <p>Maybe someone has already built an app that fits your occasion. Your assistant searches the catalogue for it. If there is one, you simply use it: free and without signing up, like every app on lernapps.net.</p>
  </li>
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Your assistant</span>
    <h3>Your material becomes your app</h3>
    <p>You give it photos of textbook pages or worksheets. From them it puts together explanations, exercises and a self-check, made for exactly your material. You decide together what is covered.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">You</span>
    <h3>A form is all it takes</h3>
    <p>You send us the content with a short form. This creates an issue: a public message in our project on GitHub, where we answer you.</p>
  </li>
  <li class="flow-step" data-who="platform">
    <span class="flow-who">We</span>
    <h3>Ready in minutes</h3>
    <p>We check the content and build the app from it. After a few minutes, its address appears in the issue. If something is not right yet, the issue says what is missing, and your assistant fixes it.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">You and the learners</span>
    <h3>Start right away</h3>
    <p>A link is all it takes: your child or the class practises on any device with a browser, without an account or an installation.</p>
  </li>
  <li class="flow-step" data-who="both">
    <span class="flow-who">You and us</span>
    <h3>What is good stays for everyone</h3>
    <p>If the app helped, it will probably help others who face the same material. A 👍 on your issue tells us so, and we check whether it fits into the catalogue. Step by step, more and more knowledge comes together that people really need.</p>
  </li>
</ol>

The app stores nothing about the learners. The self-check shows them how far they have got, and they keep the result to themselves. After two weeks the app is deleted, unless it helped; see [Lifetime](lifetime.md). [Submit: step by step](submit.md) explains every move of the submission. How it all fits into the platform is shown by the journey [A tailor-made app for an acute occasion](https://lernapps.net/docs/en/#x-tailor-made-app-h) in the platform design.

## Start with the assistant {#assistant}

Copy this sentence into the conversation with your AI assistant and describe your occasion:

```text
Read https://lernapps.net/practice/llms.txt and help me make a learning app for <occasion>.
```

For example: "for my daughter's maths test next week" or "for a cover lesson in English, year 7". The guide for the assistant is [llms.txt](llms.txt). It is written in German, and so is the content of the apps.

## Good to know {#good-to-know}

- **AI assistant with a command line:** Your assistant builds the app itself and checks it before you submit. So it usually gets through the first time. For this it needs a command line, for example Claude Code or Codex; many web assistants now have an environment of their own for it.
- **GitHub account:** To submit, you need a free GitHub account; an email address is enough. Children under 13 may not have an account of their own, so an adult submits for them. What GitHub is and how to create an account is explained in [GitHub, explained](https://lernapps.net/tooling/en/github/). Whoever practises with the app needs no account.
- **Privacy:** The form, the ZIP file and the app are public. So no names, no school and no photos belong in the content. More in [Privacy and copyright](privacy.md).
- **Two weeks:** That is how long the app stays online. How it can stay longer is explained in [Lifetime](lifetime.md).

## Where next? {#next}

| I want to … | Page |
| --- | --- |
| submit a preparation | [Submit: step by step](submit.md) |
| know what the ZIP file may contain | [Rules for content and details](rules.md) |
| know what happens to the data and who owns the content | [Privacy and copyright](privacy.md) |
| know how long an app stays | [Lifetime](lifetime.md) |
| prepare a submission as an AI assistant | [llms.txt](llms.txt) |

## For maintainers {#maintainer}

- [Operations](operations.md): what the repository is for, how it runs and how to find faults.
- [Checks](checks.md): what is checked in a submission.
- [Evaluating the guide](evaluation.md): how an agent starts and evaluates a new session after a change (manual for now).
- **Guide for assistants**: [llms.txt](llms.txt) leads to the plan template `guidance/plan-template.md`; it installs the three skills in `skills/` and the content skills of the tooling.
- [Architecture](architecture/): how the repository is built (arc42).
