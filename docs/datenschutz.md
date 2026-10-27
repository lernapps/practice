# Datenschutz und Urheberrecht

## Was gespeichert wird {#gespeichert}

| Was | Wo | Wie lange |
| --- | --- | --- |
| Dein Issue (Fach, Klassenstufe, Bundesland, Link zur ZIP-Datei, Kommentare) | GitHub, öffentlich sichtbar | bis das Issue gelöscht wird |
| Die ZIP-Datei | GitHub (Anhang des Issues; der Link ist öffentlich) | wie das Issue |
| Die gebaute Vorschau | Branch `gh-pages` dieses Repos, öffentlich unter `lernapps.net/practice/i/<Nummer>/` | zwei Wochen, oder länger mit 👍 (siehe [Lebensdauer](lebensdauer.md)) |
| Zwischenergebnisse eines Laufs (Artefakte) | GitHub Actions | 3 Tage |
| `practice.json` zur Vorschau (Fach, Klassenstufe, Bundesland, Datum) | im Ordner der Vorschau | wie die Vorschau |

**Alles hier ist öffentlich.** Reiche darum nichts ein, was nicht öffentlich sein darf.

## Persönliche Daten gehören nicht in den Inhalt {#persoenliche-daten}

Der Inhalt enthält keine Namen, keine Schule, keine Klasse, keine Lehrkraft und keine Fotos von Kindern. Das erklärst Du im Formular (zweite Erklärung). Das Feld „Fach“ gehört zum Issue und ist ebenfalls öffentlich; schreibe dort nur das Fach.

Auch das Issue selbst ist öffentlich. Schreibe dort nichts Persönliches hinein. Die Kommentare des Programms wiederholen keine Angaben aus dem Formular.

## Der Lernstand bleibt im Browser {#lernstand}

Die Vorschau sendet nichts an einen Server und setzt keine Cookies. Das prüft der Bau mit den Regeln `no-tracking` und `no-request-before-click` ([Prüfungen](pruefungen.md)). Was ein Kind in der App einstellt, liegt im Speicher des Browsers auf dem Gerät des Kindes. Es wird nie Teil des Inhalts und nie in diesem Repo gespeichert.

Die Vorschau liegt auf derselben Domain wie andere Apps der Plattform. Darum erlaubt die Regel `own-data-only` jeder App nur den Zugriff auf ihre eigenen Schlüssel im Browser-Speicher.

## Urheberrecht {#urheberrecht}

- Du reichst nur **selbst erstellte** Inhalte ein (auch mit KI-Hilfe). Nichts aus Büchern, Arbeitsblättern oder anderen Quellen abschreiben, und keine Fotos von Material. Das erklärst Du im Formular (erste Erklärung).
- Du erlaubst, dass der Inhalt **zwei Wochen** veröffentlicht wird (dritte Erklärung).
- Wird der Inhalt später in den **Katalog** aufgenommen, gilt die Lizenz **CC BY 4.0**, und Du bist Urheberin oder Urheber. Das heißt: Andere dürfen den Inhalt nutzen und ändern, wenn sie Dich nennen.
- Quellen für Fakten nennst Du im Inhalt (`sources` in `src/app.yaml`).

## Löschen {#loeschen}

- Die Vorschau löschen wir nach zwei Wochen, oder sofort, wenn Du das Issue schließt.
- Jede Änderung an den Vorschauen ersetzt den Branch `gh-pages` durch einen einzigen neuen Commit ohne Vorgänger. Gelöschte Vorschauen bleiben dort also nicht in einem alten Stand erhalten. GitHub kann nicht mehr erreichbare Stände noch eine Weile intern aufbewahren; das können wir nicht beeinflussen.
- Das Issue und die ZIP-Datei löschst Du selbst (Issue löschen, oder uns bitten). Bei Fragen schreibe einen Kommentar in Dein Issue.
