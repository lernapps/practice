# Vorbereitung üben: vorübergehende Vorschauen

Hier können Eltern und Schüler den Inhalt einer selbst erstellten Lern-App ausprobieren lassen, zum Beispiel für eine Klassenarbeit. GitHub baut aus dem Inhalt eine Vorschau mit eigener Adresse. Die Vorschau bleibt zwei Wochen und wird dann gelöscht.

## Das Wichtigste in Kürze {#kurz}

- Ein KI-Assistent erstellt aus Fotos von Schulmaterial den **Inhalt** einer kleinen Lern-App: Selbsteinschätzung, Übungen und Trainingsplan.
- Du reichst den Inhalt als **ZIP-Datei** über ein **Formular** ein. Du brauchst dafür ein GitHub-Konto.
- GitHub **prüft** den Inhalt, **baut** die App und schreibt Dir die **Adresse** in einen Kommentar.
- Die Vorschau **verschwindet nach zwei Wochen**, außer jemand setzt ein 👍 auf das erste Feld des Issues. Dann prüfen wir, ob der Inhalt in den Katalog passt.
- Der **Lernstand** Deines Kindes bleibt im Browser des Kindes. Er ist nie Teil des Inhalts.

## In fünf Schritten {#schritte}

1. Sage Deinem Assistenten, für welches Fach und welche Arbeit Ihr übt (Kasten unten).
2. Gib ihm Fotos vom Material und prüfe mit Deinem Kind die Liste der Themen.
3. Der Assistent erzeugt die ZIP-Datei mit dem Inhalt.
4. Öffne das [Formular](https://github.com/lernapps/practice/issues/new?template=einreichen.yml), ziehe die ZIP-Datei hinein und sende es ab.
5. Nach wenigen Minuten steht die Adresse der Vorschau in einem Kommentar. Öffne sie mit Deinem Kind.

Jeder Schritt ist erklärt unter [Einreichen: Schritt für Schritt](einreichen.md).

## Mit dem Assistenten starten {#assistent}

Kopiere diesen Satz in das Gespräch mit Deinem KI-Assistenten und ersetze `<Fach>`:

```text
Lies https://lernapps.net/practice/llms.txt und hilf mir, mein Kind auf die Arbeit in <Fach> vorzubereiten.
```

Die Anleitung für den Assistenten steht in [llms.txt](llms.txt). Er fragt Dich nach Fach, Klassenstufe, Bundesland und dem Tag der Arbeit.

## Gut zu wissen {#wissen}

- **GitHub-Konto:** Das Konto ist kostenlos und braucht nur eine E-Mail-Adresse. Kinder unter 13 Jahren legen es nicht selbst an, das tun die Eltern. Was GitHub ist und wie das Konto geht, steht unter [GitHub, erklärt](https://lernapps.net/tooling/github/).
- **Datenschutz:** Das Formular, die ZIP-Datei und die Vorschau sind öffentlich. Der Inhalt enthält deshalb keine Namen, keine Schule und keine Fotos. Mehr unter [Datenschutz und Urheberrecht](datenschutz.md).
- **Zwei Wochen:** Danach wird die Vorschau gelöscht. Wie Du sie länger erhältst, steht unter [Lebensdauer](lebensdauer.md).
- **Formular:** [Zum Formular](https://github.com/lernapps/practice/issues/new?template=einreichen.yml)

## Wohin als Nächstes? {#weiter}

| Ich möchte … | Seite |
| --- | --- |
| eine Vorbereitung einreichen | [Einreichen: Schritt für Schritt](einreichen.md) |
| wissen, was in der ZIP-Datei stehen darf | [Regeln für Inhalt und Angaben](regeln.md) |
| wissen, was mit den Daten geschieht und wem der Inhalt gehört | [Datenschutz und Urheberrecht](datenschutz.md) |
| wissen, wie lange eine Vorschau bleibt | [Lebensdauer](lebensdauer.md) |
| als KI-Assistent die Einreichung vorbereiten | [llms.txt](llms.txt) |

## Für Maintainer {#maintainer}

- [Betrieb](betrieb.md): wozu das Repo da ist, wie es läuft und wie man Fehler sucht.
- [Prüfungen](pruefungen.md): was bei einer Einreichung geprüft wird.
- [Architektur](architecture/): wie das Repo gebaut ist (arc42). Diese Seite gibt es nur auf Englisch.
