---
name: lernapps-practice-explainer
description: Use in Code or in a chat when you write the content of an Explainer (YAML pages with questions) from worksheets or photos for a class test, in your own words. Structure of the app, the six question types with an example, required fields, which block fits which task type, what to do with open tasks and drawings, the stumbling blocks the build reports, and how to mark facts you did not check.
license: MIT
---

# Eigenen Explainer-Inhalt aus Arbeitsblättern schreiben

## Wann benutzen

<!-- skill-only -->

- Du hast die Seitenliste aus den Fotos (Skill `lernapps-practice-photos`) und die Eltern haben den Umfang bestätigt.
  Jetzt schreibst Du den Quelltext in `src/`: `app.yaml`, je Kapitel `chapter.yaml` und die Seiten.
- Schreibe alles in eigenen Worten. Schreibe nichts ab: Fakten sind frei, Formulierungen und Abbildungen nicht.
- Prüfe jede Aussage dieses Skills am Schema, wenn Du zweifelst: `explainer.v1.schema.json` und
  `question.v1.schema.json` (Adressen unter „Vorher lesen“).

## Vorher lesen

Du schreibst den Quelltext eines Explainers. Lies vorher:
- Was er kann: https://github.com/lernapps/app-templates/blob/main/explainer/README.md
- Das Schema der Seiten: https://github.com/lernapps/app-templates/blob/main/runtime/explainer/explainer.v1.schema.json
- Das Schema der Fragen: https://github.com/lernapps/app-templates/blob/main/runtime/shared/questions/question.v1.schema.json
- Eine fertige App: https://github.com/lernapps/app-templates/tree/main/explainer/src

## Aufbau

Ein bis zwei Kapitel mit je drei bis fünf Seiten, Deutsch, in eigenen Worten, für die Stufe.
1. Seite „Selbsteinschätzung“: zehn Fragen quer durch den Stoff und eine Auswertung (0 bis 4 richtig: von vorn; 5 bis 8: gezielt; 9 bis 10: wiederholen). Das Kind zählt selbst.
2. Seite „Übungsplan“: Tabelle mit Etappen ohne Tage und Daten (Etappe, Thema, Übung), mit Links auf die Seiten. Die letzte Etappe wiederholt die Selbsteinschätzung. Auch diese Seite braucht eine Aufgabe.
3. Je Thema eine Seite: erklären, Beispiel, Übung. Jede Seite hat mindestens eine Frage.

## Fragen

Pflicht: `id` aus a-z, 0-9 und Bindestrichen; `type`; `text`; `explanation`; `links` mit `title` und einer https-`url`; `hint` ist freiwillig.
```yaml
- { type: single-choice, id: berg, text: "Welcher Berg?", explanation: "…", links: [{ title: "Titel", url: "https://…" }],
    options: [{ text: "A", correct: true, info: "Warum richtig" }, { text: "B", correct: false, info: "Warum falsch" }] }
# multiple-choice: wie single-choice, mehrere `correct: true`
# true-false:     answer: true
# number:         answer: 5, tolerance: 0, mistakes: [{ answer: 10, message: "…" }]
# ordering:       items: ["erstes", "zweites", "drittes"]   (in richtiger Reihenfolge, 2 bis 8)
# matching:       pairs: [{ left: "Fest", right: "Bedeutung" }]   (2 bis 8)
```

## Andere Blöcke

`table` (Zellen immer in Anführungszeichen, Kopfzellen nicht leer), `timeline`, `definition` (kommt ins Glossar), `note` für Info-Kasten, `example` für Beispiel.

## Stolpersteine, die der Bau meldet

- Text mit „: “ (Doppelpunkt und Leerzeichen) in Anführungszeichen setzen.
- Ein Kasten (`note`, `example`) enthält keinen weiteren Kasten und keinen Abschnitt. Setze `note` neben `example`, nicht hinein.
- Links auf Seiten der App: `/<kapitel>/<seite>/`, nicht relativ. Ein Anker (`#<id>`) braucht einen Abschnitt mit genau dieser `id` auf der Zielseite.
- Offene Aufgaben („Beschreibe …“) gibt es als Frage nicht. Nimm einen `example` „Offene Aufgabe: …“ und daneben einen `note` „Musterlösung“. Die Lösung ist sofort sichtbar. Sage das den Eltern.
- Der Bau meldet nur den ersten YAML-Fehler je Lauf. Lies Deine Dateien deshalb vorher auf „: “ in unquotierten Texten durch.

## Fakten prüfen

Fakten, die Du nicht sicher weißt (Zahlen, Daten, Namen, Zählweisen), schreibst Du nicht ungeprüft in eine Lösung. Verweise nur auf Seiten, die Du geöffnet hast. Kannst Du das nicht, nimm nur diese Quellen: https://de.wikipedia.org/ oder die der Beispiel-App. Sage den Eltern, was sie prüfen sollten.

## Pflichtfelder nach Schema

<!-- skill-only -->

| Was | Pflicht | Freiwillig |
|---|---|---|
| `app.yaml` | `title`, `intro`, `languages` (`[de]`), `chapters` (Ordnernamen) | `sources` |
| `chapter.yaml` | `title`, `pages` (Dateinamen ohne Endung) | `summary` |
| Seite | `title`, `blocks` | `description` |
| `section` | `id`, `title`, `blocks` | |
| `note`, `example` | `title`, `blocks` | |
| `table` | `caption`, `rows` | `header`, `rowHeaders` |
| `timeline` | `events` mit `date` (Jahr als Zahl) und `title` | `label` (so liest es das Kind), `text` |
| `definition` | `term`, `explanation` | |
| Frage | `id`, `type`, `text`, `explanation`, `links` (mindestens einer) | `hint`, `material`, `examples` |
| Option | `text`, `correct`, `info` | `link` |
| `number` | `answer`, `tolerance` | `unit`, `mistakes` mit `answer` und `message` |

- `single-choice`: genau eine richtige Option. `multiple-choice`: mindestens eine. Zwei bis acht Optionen.
- `id` und `section.id`: Kleinbuchstaben, Ziffern, einzelne Bindestriche, keine Umlaute.
- Eine Figur braucht `alt` und `caption`; ein Bild zusätzlich `source` und `licence`. Die Vorschau nimmt keine Bilder an,
  nimm also keine Figur mit Bild.
- Jede Seite braucht mindestens eine Frage. Ein Abschnitt „Übung“ am Ende ist üblich.

## Wenn ein Block fehlt

<!-- skill-only -->

- Offene Aufgabe: `example` „Offene Aufgabe: …“ und `note` „Musterlösung“ (siehe Stolpersteine). Sage den Eltern, dass die
  Lösung sofort sichtbar ist.
- Zeichnung, Diagramm, Plan: Tabelle, Liste oder `ordering`. `drawing` kann nur `hundred-grid` und `bar` (Prozent).
- Selbsteinschätzung: eine normale Seite mit einem Abschnitt „Übung“. Die Auswertung steht als `note`
  („0 bis 4 richtig …“). Die Seite zählt nicht mit, das Kind zählt selbst.
- Übungsplan: `table` (Etappe, Thema, Übung) mit Links `/<kapitel>/<seite>/`, ohne Tage und Daten, dazu eine Aufgabe
  (zum Beispiel `ordering` der Themen in der Reihenfolge der Etappen).

## Weiterlesen

<!-- skill-only -->

- [references/aufgabentypen.md](references/aufgabentypen.md): welche Aufgabe der Vorlage welcher Block wird.
- [references/build-meldungen.md](references/build-meldungen.md): Meldungen des Baus und ihre Lösung.
