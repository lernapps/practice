# Regeln für Inhalt und Angaben

## Was Du einreichst

Den Inhalt einer Lern-App vom Archetyp **`explainer`**: Kapitel mit Seiten, Erklärungen und Aufgaben als YAML-Dateien, dazu Bilder. Die Beschreibung der Dateien steht im [Schema des Explainers](https://github.com/lernapps/app-templates/blob/main/runtime/explainer/explainer.v1.schema.json) und in der [Anleitung zum Archetyp](https://github.com/lernapps/app-templates/tree/main/explainer). Es gibt kein Lehrwerk dazu: Du reichst eigene Inhalte ein.

## Aufbau der ZIP-Datei

- Oben in der ZIP-Datei steht der Ordner `src`. Die Datei `src/app.yaml` muss da sein.
- Es geht auch mit einem Ordner um alles herum (GitHub „Download ZIP“). Dann zählt nur `<Ordner>/src/`.
- Was außerhalb von `src` liegt, ignorieren wir und entpacken es nie.
- Wir ändern nichts an der Vorlage. `src/main.ts` und `src/components/` gehören der Vorlage und dürfen nicht in der ZIP-Datei stehen. Eigene Komponenten gibt es in einer Vorschau nicht.

## Erlaubte Dateien

| Regel | Wert |
| --- | --- |
| Endungen | `.yaml`, `.yml`, `.md`, `.png`, `.jpg`, `.webp` |
| Nicht erlaubt | alles andere, zum Beispiel `.vue`, `.ts`, `.js`, `.svg`, `.html`, `.json` |
| Namen | nur `a-z`, `A-Z`, `0-9`, `-` und `_`; genau ein Punkt vor der Endung (kein `bild.png.js`) |
| Versteckte Dateien | nicht erlaubt (Namen mit Punkt am Anfang, zum Beispiel `.DS_Store`) |
| Pfade | nur Ordner unter `src/`, höchstens 6 Ordner tief; kein `..`, kein absoluter Pfad, kein Rückwärtsstrich |
| Links und Sonderdateien | nicht erlaubt (Symlinks, Geräte); verschlüsselte Dateien nicht erlaubt |
| ZIP-Datei | höchstens 10 MB |
| Anzahl | höchstens 300 Dateien unter `src` |
| Größe entpackt | höchstens 25 MB zusammen, höchstens 10 MB je Datei |
| Zeitlimit beim Laden | 60 Sekunden |

Die Größen prüfen wir im Verzeichnis der ZIP-Datei **und** beim Entpacken. Eine ZIP-Datei, die falsche Größen angibt, wird abgelehnt. Umlaute in Dateinamen sind nicht erlaubt; im Text der YAML-Dateien sind sie selbstverständlich erlaubt.

## Die Angaben im Formular

| Feld | Regel |
| --- | --- |
| Fach | Pflicht, höchstens 60 Zeichen, eine Zeile. Steuerzeichen entfernen wir. |
| Klassenstufe | eine Zahl von 1 bis 13 aus der Liste |
| Bundesland | eines der 16 Bundesländer aus der Liste |
| ZIP-Datei | ein Link `https://github.com/user-attachments/files/<Zahl>/<Name>.zip`, den GitHub beim Hineinziehen schreibt. Andere Adressen laden wir nicht. |
| Erklärungen | alle drei angekreuzt |

## Die drei Erklärungen

1. Der Inhalt ist selbst erstellt (auch mit KI-Hilfe). Es ist nichts aus Büchern oder Arbeitsblättern abgeschrieben, und er enthält keine Fotos von Material.
2. Der Inhalt enthält keine persönlichen Daten (Namen, Schule, Klasse, Lehrkraft).
3. Ich erlaube, dass der Inhalt zwei Wochen lang veröffentlicht wird. Bei einer späteren Aufnahme in den Katalog gilt CC BY 4.0, und ich bin Urheberin oder Urheber.

Mehr dazu: [Datenschutz und Urheberrecht](datenschutz.md).

## Inhalt, der immer gilt

- Texte für Lernende sind auf Deutsch und in einfacher Sprache.
- Beispiele nutzen erfundene Namen, nie echte.
- Quellen stehen im Feld `sources` von `src/app.yaml`, wenn Du Fakten übernimmst.
- Die YAML-Regeln des Explainers sind streng. Ein Doppelpunkt oder ein Komma im Text ohne Anführungszeichen führt zu einem Fehler. Der Kommentar zeigt Dir dann die Zeile.
