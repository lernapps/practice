---
name: lernapps-practice-explore
description: Use in Explore of a lernapps practice plan when someone needs a learning app for an occasion - a class test, a cover lesson, finding out where a class stands, missed work - even if they only say "Klassenarbeit", "Vertretung" or "für die Arbeit üben". Ask the occasion first, search the catalog, say what the preview means for privacy, and agree on the concept, scope and weighting with the creator; in Plan, offer richer, interactive forms for the creator to choose.
license: MIT
---

# Anlass, Katalog und Konzept

## Wann benutzen

- Explore des Plans aus der Plan-Vorlage von lernapps practice (`.vibe/plans/01-<anlass>.md`). Der Plan sagt, wann Du
  diesen Skill lädst und wann Du wartest.
- Das Ergebnis ist ein Konzept, dem der Creator zugestimmt hat: Anlass, Themen, Umfang, Gewichtung, Seiten, Aufgaben,
  Abbildungen. Es steht unter „Notes“ und „Key decisions“ des Plans.

## Die App prüft, das Kind lernt

Eine App von lernapps practice zeigt dem Kind, was schon sitzt und wo noch Lücken sind. Das Lernen ersetzt sie nicht.
Am meisten hilft sie, wenn das Kind vorher selbst sein Material durchgesehen und überlegt hat, was es können will:
Dann prüft es mit der App seine eigenen Ziele, statt die Fragen der App auswendig zu lernen.

- Frage bei einer Arbeit, ob das Kind sein Material schon selbst durchgesehen hat und was es lernen will, in seinen
  Worten. Hat es das noch nicht, schlage vor, dass es das zuerst tut; Du wartest so lange.
- Seine Ziele bestimmen Themen und Gewichtung. Was es nicht genannt hat, das Material aber enthält, schlägst Du vor.
- Sage es auch dem Creator so: Die App prüft den Lernstand, das Lernen bleibt beim Kind.

## Zuerst der Anlass

Frage zuerst, wofür die App gebraucht wird. Der Anlass bestimmt Umfang und Gewichtung. Beispiele:

| Anlass | Was die App leisten soll |
| --- | --- |
| Eine Arbeit steht an | prüfen, was vom Stoff der Arbeit schon sitzt, nachdem das Kind ihn selbst durchgesehen hat |
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
| Arbeit | Selbsteinschätzung, Übungsplan, je Ziel des Kindes eine Seite mit Aufgaben und einer kurzen Zusammenfassung zum Nachschlagen; die Themen, bei denen es unsicher ist, mit mehr Aufgaben |
| Vertretungsstunde | wenige Seiten in der Reihenfolge der Stunde; kurze Erklärung, dann Aufgaben; eine Seite zum Abschluss |
| Stand feststellen | eine Seite mit Fragen quer durch den Stoff und einer Auswertung zuerst, dann je Thema eine Seite zum Nacharbeiten |
| Verpasster Stoff | je Thema eine Seite: erklären, Beispiel, Übung; die Reihenfolge des Unterrichts |

### Seiten, die zu einem Anlass passen

- **Selbsteinschätzung:** zehn Fragen quer durch den Stoff und eine Auswertung als Kasten (0 bis 4 richtig: von vorn;
  5 bis 8: gezielt üben; 9 bis 10: wiederholen). Die Lernenden zählen selbst.
- **Übungsplan:** eine Tabelle mit Etappen ohne Tage und Daten (Etappe, Ziel des Kindes, Übung), mit Links auf die
  Seiten. Die erste Etappe ist das eigene Durchsehen des Materials, die letzte wiederholt die Selbsteinschätzung. Auch
  diese Seite hat eine Aufgabe.
- **Je Thema:** bei einer Arbeit Aufgaben mit Rückmeldung und eine kurze Zusammenfassung zum Nachschlagen; bei
  verpasstem Stoff erklären, Beispiel, Übung. Jede Seite hat mindestens eine Frage.

Sage dem Creator dabei: Die App speichert nichts über die Lernenden. Antworten zählt die Seite nur, solange sie offen
ist; nach dem Neuladen oder auf einem anderen Gerät beginnt man von vorn.

## Reichere Formen anbieten

Zeige dem Creator im Plan, was über Auswahl und Wahr-oder-falsch hinaus möglich ist, als grobe Skizze: was das Kind
tut und was ihm das bringt. Er wählt, was ihn anspricht, oder nichts. Suche, was zu diesem Material passt und prüft,
was das Kind lernen wollte.

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
- Die App erklärt bei einer Arbeit den ganzen Stoff neu. Dann lernt das Kind die App statt seines Materials. Fasse
  kurz zusammen und lass die Aufgaben prüfen.
- Eine fertige App im Katalog passt fast. Nenne sie trotzdem; der Creator entscheidet.
- Die Gewichtung bleibt offen. Frage, was am wichtigsten ist, bevor Du die Seiten planst.
