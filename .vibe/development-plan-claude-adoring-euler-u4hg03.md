# Development Plan: practice (claude/adoring-euler-u4hg03 branch)

*Workflow: epcc, kept by hand (the workflows MCP server was not reachable in this session)*

## Goal
The start page (docs/index.md, docs/en/index.md) is to be grasped fast: more value, less text. A simulated parent
found it a wall of text that mixed parents and teachers and felt like work. Part of the landing-page rework in
lernapps/lernapps.github.io (same branch), where the home page links here as "Für eine Arbeit üben".

## Key Decisions (user, 2026-11-01, via two mockups)
- Promise and the sentence for the assistant first; then three steps, each with its numbered heading above picture
  and text: "Umfang abstecken" (not "say yes"), "Das macht dein Assistent für dich", "Üben" with a link to the real
  RE app (/practice/i/19/). The decisions picture confused and is gone.
- No link to the catalog on this page; no note on children under 13 (whoever does this is taken as older).
- "Das brauchst du" stays a section of its own; the rest (submitting, rules, lifetime, maintainers) on subpages.
- "Kopier diesen Satz in ein neues Gespräch". "du" lowercase, as on the home page.

## Code
- [x] docs/index.md and docs/en/index.md rewritten; style.css: highlighter, steps; journey and card styles and the
      unused decisions pictures removed; scripts/pages.mjs strips HTML from the title.
- [x] npm run build, npm run check, npm test

## Open
- The other pages still write "Du" with a capital letter.
