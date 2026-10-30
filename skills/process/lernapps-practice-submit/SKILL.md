---
name: lernapps-practice-submit
description: Use in Commit of a lernapps practice plan when the explainer builds and checks locally and the creator should submit it - show the creator every page and go through the declarations, make the ZIP file of src/ (pages, data, images, components), give the link to the form of lernapps/practice, explain the declarations, read the bot's answer, correct and resubmit, and tell the creator about the two weeks and the thumbs-up.
license: MIT
---

# Einreichen über lernapps practice

## Wann benutzen

- Commit des Plans aus der Plan-Vorlage von lernapps practice. `npm run build` und `npm run check` sind grün.
- Die App kommt nicht über ein eigenes Repo ins Netz: Der Creator reicht den Ordner `src/` als ZIP-Datei in einem Issue
  von `lernapps/practice` ein. GitHub prüft und baut ihn und kommentiert die Adresse. Kein Push, kein Listing.

## Alle Seiten zeigen

Der Creator bestätigt im Formular, dass der Inhalt selbst erstellt ist, keine persönlichen Daten enthält und zwei
Wochen öffentlich sein darf. Das kann er nur, wenn er jede Seite gesehen hat. Zeige sie ihm vor der ZIP-Datei, nach
`npm run build`, auf dem besten Weg, den Deine Umgebung erlaubt:

1. Läufst Du auf dem Rechner des Creators: Starte die App mit `npm run dev` und gib ihm die Adresse.
2. Sonst Bilder aller Seiten mit `npx lernapps screenshots`, wie der Skill `lernapps-cli` sagt. Zeige die Übersicht
   `screenshots/index.html`, wo Du HTML zeigen kannst, sonst die Bilder der Reihe nach. Der Ordner kommt nicht in die
   ZIP-Datei.

Dann geh mit ihm die drei Erklärungen durch, in einfachen Worten:

- Texte und Abbildungen sind neu geschrieben und gezeichnet, nichts aus dem Buch oder vom Arbeitsblatt abgeschrieben,
  keine Fotos.
- Keine Namen, keine Schule, keine Klasse, keine Lehrkraft, keine Handschrift.
- Er ist einverstanden, dass die App zwei Wochen öffentlich ist.

Nenne, worauf er besonders schauen soll: die nachgebauten Abbildungen, die Fakten, die er prüfen sollte, die Punkte
der offenen Aufgaben und den Scope (`scope:` in jeder Seite und in `src/app.yaml`: stimmt, was die Seiten lehren und was nicht dazugehört?). Erst nach
seinem Ja geht es weiter.

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
- Die Regeln: https://lernapps.net/practice/rules/

## Einreichen

Erkläre ohne Fachwörter:

1. Die Eltern brauchen ein kostenloses GitHub-Konto (https://github.com/signup), nur mit E-Mail-Adresse. Kinder unter
   13 dürfen keins haben, deshalb legen es die Eltern an.
2. Gib den Link zum Formular:
   `https://github.com/lernapps/practice/issues/new?template=submit.yml&subject=<Fach>&grade=<Zahl>&federalState=<Name>`
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
- Die App erklärt den Stoff Schritt für Schritt und prüft dann, was sitzt. Am meisten hilft sie, wenn das Kind vorher
  selbst sein Material durchgesehen hat.

## Typische Stolpersteine

- Eine ZIP-Datei aus dem Ordner über `src/` (mit `node_modules/`) ist zu groß. Packe nur `src/`.
- Ein SVG-Bild mit Skript, Ereignis-Attribut oder Verweis nach außen wird abgelehnt. Zeichne es ohne.
- Eine Datei, die nicht committet ist, fehlt in `git archive`. Committe vorher.
