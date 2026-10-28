---
name: lernapps-practice-plan
description: Use in Plan of a lernapps practice plan when the occasion and the scope of the material are clear - decide the app yourself and propose it to the creator for one yes, briefly and with your guesses highlighted - pages that explain before they practise, a self-assessment, figures, richer and interactive forms beyond choice and true-false.
license: MIT
---

# Die App vorschlagen

## Wann benutzen

- Plan des Plans aus der Plan-Vorlage von lernapps practice (`.vibe/plans/01-<anlass>.md`), wenn Anlass und Umfang
  aus Explore feststehen.
- Das Ergebnis ist ein Vorschlag, dem der Creator mit einem Ja zustimmt. Er steht unter „Key decisions“ und in den
  Aufgaben von Code.

## Ein Vorschlag, kurz

Eltern haben keine Zeit für Rückfragen. Entscheide selbst und lege einen Vorschlag vor, den der Creator in einem Zug
liest. Nicht Seite für Seite: Hebe hervor, was besonders ist, kurz und gegliedert, zum Beispiel:

- der Schwerpunkt und warum,
- was die App erklärt, bevor das Kind übt,
- die reicheren Formen und die nachgebauten Abbildungen,
- Deine Vermutungen, sichtbar markiert („(Vorschlag)“), damit der Creator sie mit einem Blick findet,
- die Fakten, die er prüfen sollte, auch umgerechnete (ein jüdisches Datum als Monat).

Bleib beim Umfang aus Explore. Was nicht im Material steht, kommt nicht hinzu.

## Erst erklären, dann üben

Die App vermittelt den Stoff und prüft ihn dann. Jede Themenseite erklärt zuerst: herleiten, ein Beispiel, eine
Abbildung, wo sie hilft. Danach kommen die Aufgaben zu genau dem, was die Seite erklärt hat. Nur die
Selbsteinschätzung prüft ohne zu erklären.

| Anlass | Seiten |
| --- | --- |
| Eine Arbeit steht an | Selbsteinschätzung zuerst, dann je Thema eine Seite; die Themen mit viel Raum im Material oder vielen Fehlern im Selbsttest ausführlicher |
| Eine Vertretungsstunde | wenige Seiten in der Reihenfolge der Stunde; eine Seite zum Abschluss |
| Den Stand einer Klasse feststellen | Fragen quer durch den Stoff mit Auswertung zuerst, dann je Thema eine Seite zum Nacharbeiten |
| Verpasster Stoff | je Thema eine Seite in der Reihenfolge des Unterrichts |

- **Selbsteinschätzung:** Fragen quer durch den Stoff und eine Auswertung als Kasten, die je nach Ergebnis auf die
  passenden Seiten verlinkt. Die Lernenden zählen selbst.
- Keine Seite nur mit Plan, Etappen oder Inhaltsverzeichnis: Die App hat ihre Navigation schon, und eine Aufgabe
  dazu prüft nichts vom Stoff.

Sage dem Creator dabei: Die App speichert nichts über die Lernenden. Antworten zählt die Seite nur, solange sie offen
ist; nach dem Neuladen oder auf einem anderen Gerät beginnt man von vorn.

## Reichere Formen vorschlagen

Über Auswahl und Wahr-oder-falsch hinaus ist viel möglich. Wähle selbst, was zu diesem Material passt, und schlage es
mit einer groben Skizze vor: was das Kind tut und was ihm das bringt.

Reichhaltige Blöcke des Explainers (wie, sagt der Skill `lernapps-explainer`):

- `labelled-figure` mit den Buchstaben des Materials als `marker` und `legend: false`; dazu ein `matching` mit
  `pairsFrom: material`: Das Kind beschriftet die Abbildung.
- `matching` mit `distractors`: Zuordnen, bei dem nicht alles aufgeht.
- `ordering` und `timeline`: Ereignisse, Schritte, Feste in ihre Reihenfolge bringen.
- `generated`: Aufgaben, die bei jedem Durchgang neu sind.
- `number` mit `mistakes`: Rückmeldung genau auf den typischen Fehler.
- `video` und `figure`: zeigen, was ein Text nur beschreibt.
- `vue-component`: alles, wofür kein Block passt.

Ideen zum Weiterdenken: auf eine Abbildung, eine Karte oder einen Kreis ziehen; Fehler in einem Text finden; in
Gruppen sortieren; erst schätzen, dann prüfen; eine kleine Geschichte mit Entscheidungen; eine Simulation, an der das
Kind dreht.

## Typische Stolpersteine

- Eine Seite beginnt mit Aufgaben. Dann rät das Kind, statt zu lernen. Erst erklären, dann üben.
- Du fragst nach Gewichtung oder Aufgabenformen. Schlage sie vor; der Creator ändert, was ihm nicht passt.
- Der Vorschlag beschreibt jede Seite. Der Creator liest ihn dann nicht. Nenne das Besondere.
- Fragen zu Stoff, der nicht im Material steht. Die App wird breit und unscharf. Bleib beim Umfang.
