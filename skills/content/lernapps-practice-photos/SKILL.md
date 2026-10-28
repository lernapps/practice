---
name: lernapps-practice-photos
description: Use in Explore of a lernapps practice plan when you read photos of school material (worksheets, book pages, self-tests), and in Code when you redraw its figures for the explainer. How to order and divide the pages, how to treat highlighted boxes, cut-off margins and the child's handwriting, which block a task of the material becomes, and how to rebuild a figure with the same content and labels as a generated image or an SVG drawing.
license: MIT
---

# Fotos von Schulmaterial lesen und Abbildungen nachbauen

## Wann benutzen

- In Explore: Du bekommst Fotos von Arbeitsblättern, Buchseiten oder Selbsttests und leitest daraus die Themen und eine
  Seitenliste ab. Lies erst alle Fotos, schreibe erst danach die Seitenliste.
- In Code: Du baust die Abbildungen des Materials für die App nach.
- Schreibe keinen Text der Fotos ab. Du schreibst eigene Texte und Aufgaben zu denselben Themen.
- Die Fotos kommen nie in die App, nie in das Repo und nie in die ZIP-Datei, auch keine Ausschnitte. Beschreibungen
  des Materials kommen nicht in den Plan.

## Fotos lesen

### Reihenfolge

- Die Reihenfolge ist die der Dateinamen oder der Aufnahmezeit, nicht die der Nachricht. Lies erst alle Fotos, dann
  schreibe die Seitenliste.

### Seiten gliedern

- Gliedere jede Seite: Titel, Spalten, Text, Abbildungen, Aufgaben. Kennzeichne hervorgehobene Kästen (Info, Merke,
  nummerierte Kurztexte), damit sie in der App wieder als Kasten erscheinen.
- Notiere jede Abbildung mit ihrem Inhalt: was sie zeigt, ihre Beschriftungen, Zahlen und die Anordnung.

### Ränder

- Am Rand hereinragende Nachbarseiten sind abgeschnitten. Nimm nur die Hauptseite.

### Handschrift des Kindes

- Kreuze, Durchstreichungen, Zahlen und ausgefüllte Felder stammen vom Kind und können falsch sein. Leite Lösungen aus
  den Fakten ab.
- Hängt eine Lösung an der Vorlage selbst (welcher Buchstabe welcher Teil ist, welches Feld wohin gehört) und lässt sie
  sich nicht sicher ablesen, frage den Creator in Explore. Buchstaben, Nummern und Beschriftungen des Materials änderst
  Du nie: Das Kind übt für dieselbe Vorlage.

### Aufgaben des Materials

- Welche Aufgabe des Materials welcher Block wird: [references/aufgabentypen.md](references/aufgabentypen.md).

## Abbildungen nachbauen

Eine Abbildung des Materials baust Du inhaltsgleich nach: dieselben Teile, dieselbe Anordnung, dieselben
Beschriftungen und Zahlen. Nur die Gestaltung ist Deine. Zeigt sie Daten (Zeiten im Jahr, Werte, eine Reihenfolge), nimm
lieber einen Block wie `timeline` oder `table`: Die App zeichnet ihn aus den Daten.

1. **Kannst Du Bilder erzeugen,** erzeuge die Abbildung neu, nach Deiner Beschreibung des Inhalts, nicht nach dem
   Foto als Vorlage. Speichere sie als `.png`, `.jpg` oder `.webp`.
2. **Sonst zeichne sie schematisch als SVG:** Formen, Linien, Pfeile, Text mit `<text>`. Berechne die Lage aus den
   Daten, statt Koordinaten zu schätzen, und setze Beschriftungen an ihren Ort statt an Linien. Ein SVG darf nur
   zeichnen: kein `<script>`, kein `on…=`, kein `<foreignObject>`, kein `<iframe>`, `<embed>` oder `<object>`, kein
   `javascript:`, kein Verweis nach außen (`href` und `url(…)` nur auf `#…` in derselben Datei), kein `@import`, kein
   `<!ENTITY`. Sonst lehnt die Einreichung das Bild ab.
3. **Ablage:** `src/images/<name>.svg` (oder `.png`, `.jpg`, `.webp`), der Name aus Kleinbuchstaben, Ziffern und
   Bindestrichen.
4. **Block:** `figure` mit `image`, `alt`, `caption`, `source` und `licence`; mit nummerierten Markern
   `labelled-figure` (`labels` mit `x`, `y` in Prozent und `text`). Wie, sagt der Skill `lernapps-explainer`.
   - `source`: `eigene Zeichnung` für ein SVG von Hand, `KI-generiert` für ein erzeugtes Bild.
   - `licence`: `CC-BY-4.0`, die Lizenz der Einreichung.
   - `alt` beschreibt den Inhalt so, dass er ohne Bild verständlich ist; die Beschriftungen gehören dazu.
5. Prüfe am Ende jede Abbildung einzeln in voller Größe, nicht im Screenshot der ganzen Seite: Stimmen alle
   Beschriftungen und Zahlen mit dem Material überein? Fehlt ein Teil? Passt jeder Buchstabe zu Form und Ort seines
   Teils, zeigt jede Linie auf das Richtige? Nennen Abbildung, `alt` und Text dieselben Fakten? Ändert sich eine
   Zuordnung, prüfe die Zeichnung erneut.

## Typische Stolpersteine

- Ein Selbsttest sieht oft wie die Fortsetzung der Seite davor aus, ist aber ein eigenes Blatt. Darum erst alle Fotos
  lesen, dann gliedern.
- Seiten liegen übereinander und Nachbarseiten schauen heraus: Randtext ist abgeschnitten und nicht verlässlich.
- Kinderschrift steht mitten in der Vorlage (Kreuze im Selbsttest, Zahlen an Diagrammen, ausgefüllte Tabellen, Datum
  am Rand). Übernimm nichts davon, auch nicht in eine Abbildung. Sind im Selbsttest mehrere Kreuze falsch oder
  durchgestrichen, lässt sich daraus keine Lösung ablesen. Leite sie aus den Fakten ab.
- Zählweisen unterscheiden sich (nach Konfession, Bundesland, Lehrwerk). Eine Zahl auf dem Foto ist eine Zählung, nicht
  das einzige richtige Ergebnis. Schreibe dann beide Zählungen mit dem Hinweis auf die Zählung.
- Eine Abbildung mit Beschriftungen zum Eintragen („Beschrifte A bis E“): eine `labelled-figure` mit den Buchstaben
  des Materials als `marker` und `legend: false`, die Zeichnung selbst ohne Buchstaben; dazu ein `matching` mit
  `pairsFrom: material`. So stehen Buchstaben und Bezeichnungen nur einmal da, und die Lösung steht nicht daneben.
- Hervorgehobene Kästen früh erkennen (Info-Kasten, nummerierte Kurztexte, Kästen mit Buchstaben). Jeder bekommt einen
  eigenen Block (`note`), damit er auf der Seite wieder sichtbar ist.
- Die Bildanalyse und das Schreiben der Seitenliste dauern lange, wenn Seiten dicht sind. Plane Zeit ein.
