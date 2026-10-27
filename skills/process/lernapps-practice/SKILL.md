---
name: lernapps-practice
description: Use in Code or in a chat when parents or a child want to prepare for a class test with a small learning app made from photos of school material, even if they only say "Klassenarbeit", "Lernzettel" or "für die Arbeit üben". The steps from the first question to the submission of the ZIP file and to practising, and the steps at which you wait for the parents.
license: MIT
---

# lernapps practice: Vorbereitung auf eine Arbeit

## Wann benutzen

<!-- skill-only -->

- Eltern oder ein Kind wollen sich mit Fotos von Schulmaterial auf eine Arbeit vorbereiten. Das Ergebnis ist der Inhalt
  eines Explainers als ZIP-Datei, den die Eltern über das Formular von `lernapps/practice` einreichen.
- Gehe die Schritte 1 bis 7 in dieser Reihenfolge durch. Bei den Schritten 1, 4 und 7 wartest Du auf die Antwort der
  Eltern.
- Schritt 3 steht im Skill `lernapps-practice-photos`, Schritt 5 im Skill `lernapps-practice-explainer`. Installiere
  beide mit diesem:
  `npx --yes skills add lernapps/practice -y -s lernapps-practice -s lernapps-practice-photos -s lernapps-practice-explainer`.
- Der Einstieg für jeden Assistenten ist <https://lernapps.net/practice/llms.txt>. Sie enthält alle drei Skills in einem
  Dokument, erzeugt mit `npm run llms`.

## Auftrag

<!-- no-heading -->

> Du hilfst Eltern oder einem Kind, sich auf eine Klassenarbeit vorzubereiten. Aus Fotos von Schulmaterial erstellst Du den Inhalt einer kleinen Lern-App mit Selbsteinschätzung, Übungen und Trainingsplan. Die Eltern reichen ihn als ZIP über ein Formular ein. GitHub baut daraus eine Vorschau, die zwei Wochen erreichbar ist.

Sprich einfach und kurz. Frage höchstens zwei Dinge pro Nachricht. Halte die Reihenfolge ein. Bei den Schritten 1, 4 und 7 wartest Du auf die Antwort.

## 1. Erfragen und suchen

Frage zuerst: Fach, Klassenstufe (1 bis 13), Bundesland, Tag der Arbeit. Bei Religion außerdem die Konfession, denn Zählweisen (Bücher der Bibel, Gebote) hängen davon ab. Frage nicht nach Lehrwerk oder Verlag und nenne beides nirgends.
Suche dann im Katalog (https://lernapps.net/apps/) nach Fach, Stufe und Thema. Passt eine App, nenne den Link und frage, ob sie reicht. Dann bist Du fertig.

## 2. Hinweise vor den Fotos

<!-- include: lernapps-practice-photos#Hinweise vor den Fotos -->

Lies den Abschnitt „Hinweise vor den Fotos“ des Skills `lernapps-practice-photos` und sage es den Eltern.

## 3. Fotos lesen

<!-- include: lernapps-practice-photos#Fotos lesen -->

Lies den Abschnitt „Fotos lesen“ des Skills `lernapps-practice-photos`.

## 4. Umfang bestätigen (hier warten)

Lege eine kurze Liste vor: Kapitel, Themen, Aufgabentypen je Seite. Bitte die Eltern, das Kind zu fragen, denn es kennt den Stoff meist besser. Korrigiere, bis sie zustimmen.

## 5. Inhalt schreiben

<!-- include: lernapps-practice-explainer -->

Lies den Skill `lernapps-practice-explainer`.

## 6. ZIP erzeugen

An der Wurzel ein Ordner `src/` mit `app.yaml`, je Kapitel ein Ordner mit `chapter.yaml` und den Seiten. Nur `.yaml`, `.yml` und `.md`. Keine Bilder, keine Fotos, keine Namen. Höchstens 300 Dateien. Kannst Du kein ZIP erzeugen, gib jede Datei mit Pfad aus und erkläre, wie man sie in `src/` legt und zippt. Formatierung übernimmt der Bau.

## 7. Einreichen (hier warten)

Erkläre ohne Fachwörter:
1. Die Eltern brauchen ein kostenloses GitHub-Konto (https://github.com/signup), nur mit E-Mail-Adresse. Kinder unter 13 dürfen keins haben, deshalb legen es die Eltern an.
2. Gib den Link zum Formular: `https://github.com/lernapps/practice/issues/new?template=einreichen.yml&fach=<Fach>&klassenstufe=<Zahl>&bundesland=<Name>` (Leerzeichen und Umlaute URL-kodiert).
3. Das ZIP in das Feld „ZIP-Datei“ ziehen, warten, bis ein Link erscheint, die drei Erklärungen anhaken (selbst erstellt, keine persönlichen Daten, zwei Wochen veröffentlichen), absenden.
4. Nach einigen Minuten kommentiert ein Bot den Link zur App. Bei Fehlermeldungen: kopieren, Dir geben, Du korrigierst das ZIP. Das neue ZIP ersetzen die Eltern im ersten Feld des Issues (Bearbeiten).
5. Sage ehrlich: Das ist eine Vorschau und wird nach zwei Wochen gelöscht. Hat sie geholfen, soll jemand eine 👍-Reaktion auf das erste Feld des Issues setzen. Dann bleibt sie erhalten und wird für den Katalog geprüft.
6. Der Lernstand des Kindes bleibt im Browser, wird nirgends gespeichert und fehlt auf anderen Geräten.

Veröffentlicht wird unter CC BY 4.0, die Eltern sind Urheber. Das bestätigen sie im Formular.
