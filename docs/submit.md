# Einreichen: Schritt für Schritt

## Vorher {#before}

1. Dein Assistent hat die Lern-App vom Archetyp `explainer` auf Deinem Rechner gebaut und geprüft. Er gibt Dir die ZIP-Datei mit dem Ordner `src` (Seiten, Bilder, Komponenten).
2. Der Inhalt erfüllt die [Regeln](rules.md). Das wichtigste: keine Namen, keine abgeschriebenen Texte, keine Fotos des Materials.
3. Du hast ein GitHub-Konto.

## So packst Du die ZIP-Datei {#pack-zip}

Packe den **Ordner `src` selbst** ein. Oben in der ZIP-Datei steht dann `src/app.yaml`. Die ZIP-Datei darf höchstens 10 MB groß sein.

Es geht auch, wenn Du das ganze Projekt als ZIP von GitHub lädst („Download ZIP“). Dann liegt alles in einem Ordner wie `mein-projekt-main/`. Wir lesen daraus nur `mein-projekt-main/src/`. Alles andere ignorieren wir und entpacken es nie.

## So reichst Du ein {#submit}

1. Öffne das Formular: <https://github.com/lernapps/practice/issues/new?template=submit.yml>
2. Fülle **Fach**, **Klassenstufe** und **Bundesland** aus.
3. Ziehe die ZIP-Datei in das Feld **ZIP-Datei**. Warte, bis dort ein Link wie `[name.zip](https://github.com/user-attachments/files/…/name.zip)` erscheint.
4. Setze bei den **drei Erklärungen** einen Haken.
5. Klicke auf **Submit new issue**.

Nach etwa einer bis drei Minuten schreibt GitHub einen Kommentar:

- **Alles gut:** Du bekommst die Adresse der Vorschau, zum Beispiel `https://lernapps.net/practice/i/12/`.
- **Etwas fehlt oder ist falsch:** Der Kommentar sagt in einfachen Worten, was. Gib ihn Deinem Assistenten.
- **Fehler beim Bauen:** Der Kommentar zeigt die Meldungen des Baus (Datei, Zeile, Regel). Gib sie Deinem Assistenten, er korrigiert den Inhalt.

## Nach einer Korrektur {#correction}

Eine neue Fassung ist mit einem Kommentar online: Ziehe die neue ZIP-Datei in das Kommentarfeld Deines Issues, warte auf den Link und klicke auf **Comment**. GitHub prüft und baut dann neu und ersetzt die Vorschau und seinen alten Kommentar. Es zählt immer die zuletzt angehängte ZIP-Datei. Nur Deine eigenen Kommentare zählen, nicht die von anderen.

Eine Angabe des Formulars (Fach, Klassenstufe, Bundesland) änderst Du am ersten Feld: die drei Punkte, dann **Edit**. Bleiben ZIP-Datei und Angaben gleich, baut GitHub nicht neu.

## Das Formular vorausfüllen {#prefill}

Das Formular lässt sich über Parameter in der Adresse vorausfüllen. Das hilft Assistenten, die Dir einen fertigen Link geben. Die Namen der Parameter sind die Kennungen (ids) der Felder:

| Parameter | Feld | Beispielwert |
| --- | --- | --- |
| `template` | immer `submit.yml` | `submit.yml` |
| `title` | Titel des Issues | `Vorbereitung: Religion` |
| `subject` | Fach | `Religion` |
| `grade` | Klassenstufe (eine Zahl von 1 bis 13) | `7` |
| `federalState` | Bundesland (genau wie in der Liste) | `Hessen` |

Beispiel:

```text
https://github.com/lernapps/practice/issues/new?template=submit.yml&title=Vorbereitung%3A%20Religion&subject=Religion&grade=7&federalState=Hessen
```

Sonderzeichen müssen in der Adresse umgeschrieben werden: Leerzeichen als `%20`, ü als `%C3%BC` (zum Beispiel `Baden-W%C3%BCrttemberg`). Die ZIP-Datei und die Erklärungen kannst Du nicht vorausfüllen. Die Erklärungen musst Du selbst ankreuzen.

## Wenn etwas nicht klappt {#problems}

- **Kein Kommentar nach fünf Minuten:** Öffne den Reiter „Actions“ des Repos und suche den Lauf „Submission“. Schreibe uns einen Kommentar ins Issue.
- **„Kein ZIP gefunden“:** Die ZIP-Datei ist nicht angekommen. Hänge sie als Kommentar an und warte auf den Link, bevor Du auf **Comment** klickst.
- **Die Seite lädt noch nicht:** GitHub braucht manchmal einige Minuten, bis die Adresse antwortet. Versuche es später noch einmal.
