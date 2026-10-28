---
name: lernapps-practice-submit
description: Use in Commit of a lernapps practice plan when the explainer builds and checks locally and the creator should submit it - make the ZIP file of src/ (pages, data, images, components), give the link to the form of lernapps/practice, explain the declarations, read the bot's answer, correct and resubmit, and tell the creator about the two weeks and the thumbs-up.
license: MIT
---

# Einreichen über lernapps practice

## Wann benutzen

- Commit des Plans aus der Plan-Vorlage von lernapps practice. `npm run build` und `npm run check` sind grün.
- Die App kommt nicht über ein eigenes Repo ins Netz: Der Creator reicht den Ordner `src/` als ZIP-Datei in einem Issue
  von `lernapps/practice` ein. GitHub prüft und baut ihn und kommentiert die Adresse. Kein Push, kein Listing.

## ZIP-Datei erzeugen

Im Ordner der App, nachdem alles committet ist:

```sh
git archive --format=zip --output=../<anlass>.zip HEAD src
```

- Oben in der ZIP-Datei steht `src/` mit `app.yaml`, den Kapiteln, `data/`, `images/` und `components/`. `src/main.ts`
  darf darin stehen; die Einreichung ignoriert es und nimmt das der Vorlage.
- Erlaubt: `.yaml`, `.yml`, `.md`, `.png`, `.jpg`, `.webp`; `.svg` nur in `src/images/`; `.vue` und `.ts` nur in
  `src/components/` (`<Name>.vue`, `<Name>.ts`, `<Name>.test.ts`). Höchstens 300 Dateien und 10 MB.
- Keine Fotos des Materials, keine Namen.
- Die Regeln: https://lernapps.net/practice/regeln/

## Einreichen

Erkläre ohne Fachwörter:

1. Die Eltern brauchen ein kostenloses GitHub-Konto (https://github.com/signup), nur mit E-Mail-Adresse. Kinder unter
   13 dürfen keins haben, deshalb legen es die Eltern an.
2. Gib den Link zum Formular:
   `https://github.com/lernapps/practice/issues/new?template=einreichen.yml&fach=<Fach>&klassenstufe=<Zahl>&bundesland=<Name>`
   (Leerzeichen und Umlaute URL-kodiert).
3. Die ZIP-Datei in das Feld „ZIP-Datei“ ziehen, warten, bis ein Link erscheint, die drei Erklärungen anhaken (selbst
   erstellt, keine persönlichen Daten, zwei Wochen veröffentlichen), absenden.
4. Veröffentlicht wird unter CC BY 4.0, die Eltern sind Urheber. Das bestätigen sie im Formular.

## Antwort und Korrektur

- Nach einigen Minuten kommentiert ein Bot das Issue. Bitte den Creator, Dir den Kommentar zu geben.
- Nennt er Probleme (Datei, Zeile, Regel): Korrigiere `src/`, prüfe mit `npm run build` und `npm run check`, committe,
  erzeuge eine neue ZIP-Datei. Die Eltern hängen sie als Kommentar an das Issue an (ins Kommentarfeld ziehen, auf den
  Link warten, „Comment“). GitHub prüft und baut dann neu; es zählt die zuletzt angehängte ZIP-Datei.
- Nennt er die Adresse (`https://lernapps.net/practice/i/<Nummer>/`): Öffne sie und prüfe, dass die App erscheint.
- Wünscht der Creator danach eine Änderung: wie bei Problemen. Die Vorschau zeigt sie erst nach dem neuen Kommentar des
  Bots; prüfe sie dort, bevor Du sie als erledigt meldest.

## Danach

Sage ehrlich:

- Das ist eine Vorschau. Sie wird nach zwei Wochen gelöscht.
- Hat sie geholfen, soll jemand eine 👍-Reaktion auf das erste Feld des Issues setzen. Dann bleibt sie erhalten und
  wird für den Katalog geprüft. Dieses Feedback hilft auch anderen, die vor demselben Stoff stehen.
- Die App speichert nichts über die Lernenden. Die Selbsteinschätzung zählen sie selbst.
- Die App prüft den Lernstand. Das Lernen ersetzt sie nicht: Am meisten hilft sie, wenn das Kind zuerst selbst sein
  Material durchsieht und dann mit ihr prüft, was sitzt.

## Typische Stolpersteine

- Eine ZIP-Datei aus dem Ordner über `src/` (mit `node_modules/`) ist zu groß. Packe nur `src/`.
- Ein SVG-Bild mit Skript, Ereignis-Attribut oder Verweis nach außen wird abgelehnt. Zeichne es ohne.
- Eine Datei, die nicht committet ist, fehlt in `git archive`. Committe vorher.
