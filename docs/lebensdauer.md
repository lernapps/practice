# Lebensdauer einer Vorschau

Eine Vorschau lebt **zwei Wochen** (14 Tage). Danach wird sie automatisch gelöscht, außer eine Person hat sie mit 👍 gerettet.

## Die Regeln

| Lage | Was passiert |
| --- | --- |
| Das Issue ist **geschlossen** | Die Vorschau wird **sofort** gelöscht. Es gibt keinen Kommentar, denn jemand hat das Issue mit Absicht geschlossen. |
| Der Ablauftag ist noch nicht erreicht | Die Vorschau bleibt. |
| Der Ablauftag ist erreicht, und auf dem **ersten Feld des Issues** liegt mindestens ein 👍 von einem **Menschen** (nicht von einem Bot) | Die Vorschau **bleibt**, bis das Issue geschlossen wird. Wir prüfen, ob der Inhalt in den Katalog passt. |
| Der Ablauftag ist erreicht, kein 👍 | Die Vorschau wird gelöscht, und ein kurzer Kommentar im Issue sagt es. |

Der Ablauftag steht in `i/<Nummer>/practice.json` (Feld `laeuftAb`). Maßgeblich ist dieses Datum, **nicht** die Zeit eines Commits.

## Neu veröffentlichen

Jede neue Veröffentlichung für dasselbe Issue ersetzt die alte und beginnt die zwei Wochen neu. Das passiert, wenn Du das Issue mit einer neuen ZIP-Adresse oder anderen Angaben bearbeitest. Nach dem Ablauf der Vorschau geht es genauso: Issue bearbeiten, neue ZIP-Datei hineinziehen, speichern.

Ein Wartungsteam kann den Lauf auch ohne neues Anhängen wiederholen ([Betrieb](betrieb.md)).

## Wann das Aufräumen läuft

Der Workflow „Aufräumen“ läuft

- **täglich** um 03:23 Uhr UTC (prüft alle Ordner),
- **sofort**, wenn ein Issue geschlossen wird (prüft dessen Ordner),
- **von Hand** (mit der Option „dry-run“, die nur anzeigt, was gelöscht würde).

## Ordner ohne passendes Issue

Der Workflow betrachtet nur Ordner `i/<Zahl>/` auf `gh-pages`. Alles andere (zum Beispiel die Startseite und `.nojekyll`) bleibt unberührt, ebenso Einträge von `i/`, deren Name keine Zahl ist.

- **Ordner ohne lesbare `practice.json`**, oder mit einer für ein anderes Issue: wird **sofort gelöscht**. Das Programm schreibt die Dateien und die `practice.json` in einem einzigen Commit. Ein solcher Ordner stammt also nicht von diesem Ablauf.
- **Ordner, dessen Issue nicht mehr existiert** (gelöscht oder verschoben): bleibt bis zum Ablauftag in `practice.json` und wird dann ohne Kommentar gelöscht. Ein 👍 kann es nicht mehr geben.
- **Issue mit 👍, aber geschlossen**: wird gelöscht. Schließen beendet die Vorschau immer.
