---
name: lernapps-practice-explore
description: Use in Explore of a lernapps practice plan when someone needs a learning app for an occasion - a class test, a cover lesson, finding out where a class stands, missed work - even if they only say "Klassenarbeit", "Vertretung" or "für die Arbeit üben". Ask the occasion first, search the catalog, say what the preview means for privacy, and agree on the concept, scope and weighting with the creator.
license: MIT
---

# Anlass, Katalog und Konzept

## Wann benutzen

- Explore des Plans aus der Plan-Vorlage von lernapps practice (`.vibe/plans/01-<anlass>.md`). Der Plan sagt, wann Du
  diesen Skill lädst und wann Du wartest.
- Das Ergebnis ist ein Konzept, dem der Creator zugestimmt hat: Anlass, Themen, Umfang, Gewichtung, Seiten, Aufgaben,
  Abbildungen. Es steht unter „Notes“ und „Key decisions“ des Plans.

## Zuerst der Anlass

Frage zuerst, wofür die App gebraucht wird. Der Anlass bestimmt Umfang und Gewichtung. Beispiele:

| Anlass | Was die App leisten soll |
| --- | --- |
| Eine Arbeit steht an | gezielt den Stoff der Arbeit üben; sehen, was schon sitzt |
| Eine Vertretungsstunde | Übungen für eine Stunde zu dem, was die Klasse gerade durchnimmt |
| Den Stand einer Klasse feststellen | Fragen quer durch den Stoff; jeder sieht, wo er steht |
| Verpasster Stoff | den Stoff erklären, dann Schritt für Schritt üben |

Frage danach: Fach, Klassenstufe (1 bis 13), Bundesland. Bei Religion auch die Konfession, denn Zählweisen (Bücher der
Bibel, Gebote) hängen davon ab. Frage nicht nach Lehrwerk oder Verlag und nenne beides nirgends.

## Den Katalog durchsuchen

Lies den Katalog vollständig: https://lernapps.net/apps/llms.txt (mit curl laden, dann lesen). Suche nach Fach, Stufe
und Thema. Passt eine App zum Anlass, nenne den Link und frage, ob sie reicht. Reicht sie, endet der Plan.

## Was der Creator vorher wissen muss

Sage es kurz, bevor das Material kommt:

- Die App ist zwei Wochen lang öffentlich erreichbar, unter einer Adresse mit Nummer. Das Issue, in dem sie
  eingereicht wird, ist ebenfalls öffentlich.
- Namen, Schule, Klasse, Lehrkraft und die Handschrift des Kindes kommen nicht in die App.

Mehr nicht: Was Du mit dem Material tust, sagt der Skill `lernapps-practice-photos`.

## Das Konzept abstimmen

Lege ein kurzes Konzept vor: Themen, Umfang, Gewichtung, je Seite was die Lernenden tun, welche Abbildungen Du
nachbaust. Bitte bei einer Arbeit die Eltern, das Kind zu fragen; es kennt den Stoff meist besser. Korrigiere, bis der
Creator zustimmt.

Umfang: ein bis zwei Kapitel mit je drei bis fünf Seiten, Deutsch, für die Stufe. Gewichtung je nach Anlass:

| Anlass | Seiten |
| --- | --- |
| Arbeit | Selbsteinschätzung, Übungsplan, je Thema eine Seite; die Themen, bei denen das Kind unsicher ist, mit mehr Aufgaben |
| Vertretungsstunde | wenige Seiten in der Reihenfolge der Stunde; kurze Erklärung, dann Aufgaben; eine Seite zum Abschluss |
| Stand feststellen | eine Seite mit Fragen quer durch den Stoff und einer Auswertung zuerst, dann je Thema eine Seite zum Nacharbeiten |
| Verpasster Stoff | je Thema eine Seite: erklären, Beispiel, Übung; die Reihenfolge des Unterrichts |

### Seiten, die zu einem Anlass passen

- **Selbsteinschätzung:** zehn Fragen quer durch den Stoff und eine Auswertung als Kasten (0 bis 4 richtig: von vorn;
  5 bis 8: gezielt üben; 9 bis 10: wiederholen). Die Lernenden zählen selbst.
- **Übungsplan:** eine Tabelle mit Etappen ohne Tage und Daten (Etappe, Thema, Übung), mit Links auf die Seiten. Die
  letzte Etappe wiederholt die Selbsteinschätzung. Auch diese Seite hat eine Aufgabe.
- **Je Thema:** erklären, Beispiel, Übung. Jede Seite hat mindestens eine Frage.

Sage dem Creator dabei: Die App speichert nichts über die Lernenden. Antworten zählt die Seite nur, solange sie offen
ist; nach dem Neuladen oder auf einem anderen Gerät beginnt man von vorn.

## Typische Stolpersteine

- Der Anlass fehlt, und die App wird zu breit. Frage ihn zuerst, auch wenn schon Fotos da sind.
- Eine fertige App im Katalog passt fast. Nenne sie trotzdem; der Creator entscheidet.
- Die Gewichtung bleibt offen. Frage, was am wichtigsten ist, bevor Du die Seiten planst.
