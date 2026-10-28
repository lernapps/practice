---
name: lernapps-practice-explore
description: Use in Explore and Plan of a lernapps practice plan when someone needs a learning app for an occasion - a class test, a cover lesson, finding out where a class stands, missed work - even if they only say "Klassenarbeit", "Vertretung" or "für die Arbeit üben". Ask once what only the creator knows, search the catalog, say what the preview means for privacy, then propose the whole concept yourself - topics, weighting, pages that explain before they practise, figures, richer forms - for one yes.
license: MIT
---

# Anlass, Katalog und Konzept

## Wann benutzen

- Explore und Plan des Plans aus der Plan-Vorlage von lernapps practice (`.vibe/plans/01-<anlass>.md`). Der Plan sagt,
  wann Du diesen Skill lädst und wann Du wartest.
- Das Ergebnis ist ein Vorschlag, dem der Creator mit einem Ja zustimmt: Anlass, Themen, Gewichtung, Seiten, Aufgaben,
  Abbildungen. Es steht unter „Notes“ und „Key decisions“ des Plans.

## Der Creator hat wenig Zeit

Eltern haben keine Zeit für viele Rückfragen. Frage nur, was nur der Creator weiß, in einer Nachricht. Alles andere
entscheidest Du selbst und legst es als Vorschlag vor; der Creator sagt Ja oder ändert, was ihm nicht passt.

Frage in der ersten Nachricht:

- wofür die App gebraucht wird (der Anlass),
- Fach, Klassenstufe (1 bis 13), Bundesland; bei Religion die Konfession, denn Zählweisen (Bücher der Bibel, Gebote)
  hängen davon ab,
- nach dem Material (Fotos von Arbeitsblättern, Buchseiten, Selbsttests).

Sage in derselben Nachricht, was der Creator vorher wissen muss:

- Die App ist zwei Wochen lang öffentlich erreichbar, unter einer Adresse mit Nummer. Das Issue, in dem sie
  eingereicht wird, ist ebenfalls öffentlich.
- Namen, Schule, Klasse, Lehrkraft und die Handschrift des Kindes kommen nicht in die App.
- Am meisten hilft die App, wenn das Kind vorher selbst sein Material durchsieht. Das ist ein Tipp; Du wartest nicht
  darauf.

Frage nicht nach Lehrwerk oder Verlag und nenne beides nirgends. Frage nicht nach Gewichtung, Abbildungen oder
Aufgabenformen: Das schlägst Du vor.

## Den Katalog durchsuchen

Lies den Katalog vollständig: https://lernapps.net/apps/llms.txt (mit curl laden, dann lesen). Suche nach Fach, Stufe
und Thema. Passt eine App zum Anlass, nenne den Link und frage, ob sie reicht. Reicht sie, endet der Plan.

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

Umfang: ein bis zwei Kapitel, Deutsch, für die Stufe.

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

- Der Anlass fehlt, und die App wird zu breit. Frage ihn zuerst, auch wenn schon Fotos da sind.
- Eine fertige App im Katalog passt fast. Nenne sie trotzdem; der Creator entscheidet.
- Eine Seite beginnt mit Aufgaben. Dann rät das Kind, statt zu lernen. Erst erklären, dann üben.
- Du fragst nach Gewichtung oder Aufgabenformen. Schlage sie vor; der Creator ändert, was ihm nicht passt.
