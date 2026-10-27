# Solution Strategy

GitHub does the work: the issue is the form, an action builds, Pages serves. The approach follows from the decisions
and concepts; this chapter only maps them to the goals.

```arc42
:::solution-strategy
id: strategy-practice
title: Content checked by the build; rights apart; previews end by themselves
addresses: qg-nothing-collected, qg-safe-input, qg-quick, qg-understandable
:::
```

| Quality goal | Approach |
|---|---|
| `qg-nothing-collected` | `dec-nothing-stored`, `dec-temporary-preview`; the platform's rules for a bundle stop a failing build (`dec-pin-from-tooling-main`) |
| `qg-safe-input` | `dec-content-and-components`, `dec-rights-split`, `concept-rights-split`, `concept-bounded-input`, `concept-svg-only-draws` |
| `qg-quick` | `dec-issue-not-pull-request`, `dec-github-builds`: a chain of jobs without a queue of its own |
| `qg-understandable` | One comment per rejection that says what to change (`qs-rejection-actionable`, `qs-correct-and-retry`); one plan for the assistant (`dec-plan-and-phase-skills`) |
