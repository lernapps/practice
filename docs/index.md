# Vorbereitung üben: vorübergehende Vorschauen

Hier können Eltern und Schüler den Inhalt einer selbst erstellten Lern-App ausprobieren lassen, zum Beispiel für eine Klassenarbeit. GitHub baut aus dem Inhalt eine Vorschau mit eigener Adresse. Die Vorschau bleibt zwei Wochen und wird dann gelöscht.

## Das Wichtigste in Kürze

- Du reichst den **Quelltext** einer Lern-App als ZIP-Datei ein (Archetyp `explainer`). Du brauchst dafür ein GitHub-Konto.
- Du füllst ein **Formular** aus (ein GitHub-Issue) und ziehst die ZIP-Datei hinein.
- Ein Programm auf GitHub **prüft** den Inhalt, **baut** die App und schreibt Dir die **Adresse** in einen Kommentar.
- Die Vorschau **verschwindet nach zwei Wochen**, außer Du oder jemand anderes setzt ein 👍 auf das erste Feld des Issues. Dann prüfen wir, ob der Inhalt in den Katalog passt.
- Der **Lernstand** Deines Kindes bleibt im Browser des Kindes. Er ist nie Teil des Inhalts.

## Wohin als Nächstes?

| Ich möchte … | Seite |
| --- | --- |
| eine Vorbereitung einreichen | [Einreichen: Schritt für Schritt](einreichen.md) |
| wissen, was in der ZIP-Datei stehen darf | [Regeln für Inhalt und Angaben](regeln.md) |
| wissen, was bei der Prüfung passiert | [Was geprüft wird](pruefungen.md) |
| wissen, was mit den Daten geschieht und wem der Inhalt gehört | [Datenschutz und Urheberrecht](datenschutz.md) |
| wissen, wie lange eine Vorschau bleibt | [Lebensdauer](lebensdauer.md) |
| den Betrieb verstehen oder reparieren | [Betrieb](betrieb.md) |
| als KI-Assistent die Einreichung vorbereiten | [llms.txt](llms.txt) |

## Wozu dieses Repo da ist

Das Repo `lernapps/practice` enthält nur die Dokumentation, das Formular und die Abläufe (Workflows). Es enthält keine Apps und keine Laufzeit. Die App entsteht bei jeder Einreichung neu aus Deinem Inhalt und der Vorlage `explainer` aus [lernapps/app-templates](https://github.com/lernapps/app-templates).

Ein Build im Browser ist nicht möglich, weil die Bau-Werkzeuge native Programme brauchen. Deshalb baut GitHub. Und weil ein Pull Request aus einem Fork keine Vorschau bekäme, nutzen wir ein Issue und keinen Pull Request.
