# Betrieb

Für Menschen, die das Repo pflegen.

## Bausteine

| Teil | Aufgabe |
| --- | --- |
| `.github/ISSUE_TEMPLATE/einreichen.yml` | Das Formular. Die ids `fach`, `klassenstufe`, `bundesland`, `zip`, `erklaerungen` und die Listen sind fest. `actions/lib/limits.ts` kennt dieselben Listen; ein Test vergleicht sie. |
| `.github/workflows/einreichung.yml` | Drei Jobs für eine Einreichung: `intake`, `build`, `publish`. |
| `.github/workflows/aufraeumen.yml` | Löscht Vorschauen, die vorbei sind. |
| `.github/workflows/check.yml` | Testet die Skripte (`npm test`) und die Workflows (actionlint). |
| `actions/validate`, `build`, `publish`, `expire` | Lokale Composite-Actions mit der Logik. Jede hat eine `action.yml` und ein Skript in TypeScript ohne Abhängigkeiten. |
| `actions/lib/` | Gemeinsamer Code: ZIP lesen und prüfen, Formular lesen, GitHub-Aufrufe, der Branch `gh-pages`. |
| `package.json` | Enthält `appTemplates.commit`, den Stand der Vorlagen. Es ist derselbe wie im Tooling (`lernapps/tooling`, `package.json`). |

## Die Jobs mit ihren Rechten

| Job | Rechte | Er darf … |
| --- | --- | --- |
| `intake` | `issues: read`, `contents: read` | das Issue lesen, die ZIP-Datei laden, prüfen, entpacken. Er schreibt nichts nach GitHub. |
| `build` | `contents: read`, keine Geheimnisse | bauen und prüfen. Er kann weder Issues noch Branches ändern. |
| `publish` | `contents: write`, `issues: write`, `pages: read` | `gh-pages` schreiben und kommentieren. Er führt nur Code aus diesem Repo aus. |

Text aus dem Issue steht nie in einem `run:`-Schritt. Er läuft nur über Dateien oder Umgebungsvariablen, und die Skripte prüfen ihn streng (zum Beispiel die Issue-Nummer gegen `^[1-9][0-9]{0,8}$`). Alle Actions von Dritten sind auf einen Commit festgelegt.

Die Läufe für ein Issue brechen sich gegenseitig ab (`concurrency` je Issue). Das Schreiben auf `gh-pages` läuft in der Gruppe `gh-pages`, auch das Aufräumen. GitHub hält in einer Gruppe höchstens einen laufenden und einen wartenden Lauf. Kommen mehr, fällt der älteste wartende weg. Dann hilft eine Wiederholung (siehe unten). Schreibt jemand zwischen Lesen und Schreiben auf `gh-pages`, schlägt das Schreiben fehl (`--force-with-lease`) und wird bis zu fünfmal auf dem neuen Stand wiederholt.

## Ein Lauf wiederholen (workflow_dispatch)

Wer Schreibrechte hat, kann den Lauf für ein bestehendes Issue wiederholen, ohne die ZIP-Datei neu anzuhängen:

1. Öffne im Repo „Actions“ und wähle „Einreichung“.
2. Klicke auf „Run workflow“ und trage die Nummer des Issues ein (`issue`).

Eine Wiederholung baut immer neu, auch wenn ZIP-Adresse und Angaben gleich sind. Das Aufräumen lässt sich genauso von Hand starten. Es ist standardmäßig ein Trockenlauf: er zeigt in der Zusammenfassung, was er löschen würde, und ändert nichts. Mit `dry-run` aus löscht er wirklich; mit `issue` betrifft es nur ein Issue.

## Einstellungen im Repo (nur Verwaltende)

- **Issues** eingeschaltet.
- **Pages**: Quelle „Deploy from a branch“, Branch `gh-pages`, Ordner `/ (root)`. Den Branch legt die erste Veröffentlichung an. Erst danach ist die Auswahl möglich.
- **Adresse**: Für ein Repo der Organisation `lernapps` liefert Pages `https://lernapps.net/practice/`. Das hängt an der Domain der Organisation (`lernapps.github.io`), nicht an diesem Repo.
- **Actions**: erlaubt; „Workflow permissions“ müssen nicht auf „Read and write“ stehen, die Workflows setzen ihre Rechte selbst.
- **Reaktionen**: Die Regel „👍 hält die Vorschau“ gilt für Reaktionen auf das Issue (das erste Feld), nicht auf Kommentare.

## Updates

- Renovate (Voreinstellung aus `lernapps/tooling`) hebt die festgelegten Commits der Actions an.
- `appTemplates.commit` in der `package.json` hebt man von Hand an, gemeinsam mit dem Tooling: Commit aus `lernapps/tooling/package.json` übernehmen, dann einen Lauf für ein Test-Issue prüfen.

## Missbrauch und Grenzen

Jedes GitHub-Konto kann ein Issue anlegen und damit einen Lauf starten. Das schützt nur die Menge der Grenzen: kleine Dateien, kurze Läufe, getrennte Rechte. Wer das Repo pflegt, schließt oder sperrt Issues, die offensichtlich Unsinn sind. Geschlossene Issues verlieren ihre Vorschau sofort.

## Fehler suchen

| Bild | Ursache |
| --- | --- |
| Kein Kommentar, Lauf „Einreichung“ grün | Das Issue stammt nicht aus dem Formular (eine Überschrift fehlt), oder ZIP-Adresse und Angaben sind gleich wie beim letzten Lauf. Das Protokoll von `intake` sagt es. |
| `publish` rot: „cannot push gh-pages“ | Mehrere Läufe gleichzeitig. Wiederholen. |
| Kommentar „Falls die Seite noch nicht lädt“ | Pages hat den Stand noch nicht ausgeliefert. Meist nach wenigen Minuten da. Prüfe die Pages-Einstellung. |
| `build` rot bei `npm ci` | Die Lock-Datei der Vorlage passt nicht zum Stand. Prüfe `appTemplates.commit`. |
