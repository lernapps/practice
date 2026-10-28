# Betrieb

Für Menschen, die das Repo pflegen.

## Wozu dieses Repo da ist {#purpose}

Das Repo `lernapps/practice` enthält nur die Dokumentation, das Formular und die Abläufe (Workflows). Es enthält keine Apps und keine Laufzeit. Die App entsteht bei jeder Einreichung neu aus Deinem Inhalt und der Vorlage `explainer` aus [lernapps/app-templates](https://github.com/lernapps/app-templates).

Ein Build im Browser ist nicht möglich, weil die Bau-Werkzeuge native Programme brauchen. Deshalb baut GitHub. Und weil ein Pull Request aus einem Fork keine Vorschau bekäme, nutzen wir ein Issue und keinen Pull Request.

## Bausteine {#building-blocks}

| Teil | Aufgabe |
| --- | --- |
| `.github/ISSUE_TEMPLATE/submit.yml` | Das Formular. Die ids `subject`, `grade`, `federalState`, `zip`, `declarations` und die Listen sind fest. `actions/lib/limits.ts` kennt dieselben Listen; ein Test vergleicht sie. |
| `.github/workflows/submission.yml` | Drei Jobs für eine Einreichung: `intake`, `build`, `publish`. |
| `.github/workflows/cleanup.yml` | Löscht Vorschauen, die vorbei sind. |
| `.github/workflows/check.yml` | Testet die Skripte (`npm test`) und die Workflows (actionlint). |
| `.github/workflows/pages.yml` | Baut und prüft diese Seite und veröffentlicht sie auf `gh-pages` (siehe [Die Seite](#page)). Die Pflichtprüfung heißt `site`. |
| `.github/workflows/pr-preview.yml` | Eine Vorschau dieser Seite je Pull Request. |
| `docs/*.md`, `docs/en/*.md`, `scripts/`, `site/` | Die Texte (Deutsch und Englisch), das Bauskript und der Stil dieser Seite. |
| `docs/llms.txt`, `guidance/plan-template.md` | Der Einstieg für Assistenten und die Plan-Vorlage, der sie folgen (siehe [Evaluation der Anleitung](evaluation.md)). |
| `skills/` | Die vier Skills von practice, die die Plan-Vorlage installiert: `lernapps-practice-explore`, `lernapps-practice-plan`, `lernapps-practice-photos`, `lernapps-practice-submit`. |
| `scripts/try.ts` | Der lokale Probelauf: schickt ein ZIP durch Prüfung und Bau der Actions (`npm run try -- <zip>`). |
| `docs/arc42/` | Die Architektur dieses Repos als arc42-Modell, nur auf Englisch. Das Bauskript prüft sie mit `arc42 validate --strict` und veröffentlicht sie unter [Architektur](architecture/). |
| `actions/validate`, `build`, `publish`, `expire` | Lokale Composite-Actions mit der Logik. Jede hat eine `action.yml` und ein Skript in TypeScript ohne Abhängigkeiten. |
| `actions/lib/` | Gemeinsamer Code: ZIP lesen und prüfen, Formular lesen, GitHub-Aufrufe, der Branch `gh-pages`. |
| `package.json` | Die Werkzeuge der Seite und die Befehle (`npm test`, `npm run build`, `npm run try`). Den Stand der Vorlagen hält sie nicht: Der Bau liest ihn aus dem Tooling (siehe [Updates](#updates)). |

## Die Seite {#page}

Diese Seite (`https://lernapps.net/practice/`) entsteht aus `docs/*.md` (Deutsch) und `docs/en/*.md` (Englisch, gleiche Dateinamen und gleiche Überschriften-Anker). `npm ci && npm run build && npm run check` baut sie in `_site/` und prüft sie, wie bei den anderen Seiten von lernapps.net. Die Überschrift einer Seite darf mit `{#anchor}` enden. Ein Link auf eine andere Seite steht als Dateiname im Text (`rules.md#details`) und wird zur Adresse in derselben Sprache. `docs/llms.txt` ist der Einstieg für Assistenten, von Hand gepflegt und kurz; sie wird unverändert als `llms.txt` ausgeliefert. Ein Test prüft, dass die Adressen und Befehle darin stimmen.

Auf dem Branch `gh-pages` liegen drei Dinge nebeneinander:

| Ort | Wer schreibt | Wer lässt es in Ruhe |
| --- | --- | --- |
| Wurzel (die Seite) | `pages.yml` (Aktion `site-deploy`) | `submission.yml` und `cleanup.yml` fassen sie nie an. Der Platzhalter `index.html` entsteht nur, wenn keine Seite da ist. |
| `i/<Nummer>/` (Einreichungen) | `submission.yml`, `cleanup.yml` | `pages.yml` lässt `i/` stehen (`keep: i/`). |
| `pr-preview/pr-<Nummer>/` (Vorschau je Pull Request) | `pr-preview.yml` | `pages.yml` lässt den Ordner stehen (die Aktion tut das immer). Die Einreichungen fassen ihn nie an. |

Einreichung, Aufräumen und die Veröffentlichung der Seite schreiben nacheinander (Gruppe `gh-pages`). Die Vorschau je Pull Request hat eine eigene Gruppe. Stoßen zwei Schreiber zusammen, scheitert ein Push; dann hilft es, den Lauf zu wiederholen. Ein Test (`test/site-on-gh-pages.test.ts`) prüft, dass Veröffentlichen und Aufräumen die Seite und `pr-preview/` nicht ändern.

## Die Jobs mit ihren Rechten {#jobs}

| Job | Rechte | Er darf … |
| --- | --- | --- |
| `intake` | `issues: read`, `contents: read` | das Issue lesen, die ZIP-Datei laden, prüfen, entpacken. Er schreibt nichts nach GitHub. |
| `build` | `contents: read`, keine Geheimnisse | bauen und prüfen. Er kann weder Issues noch Branches ändern. |
| `publish` | `contents: write`, `issues: write`, `pages: read` | `gh-pages` schreiben und kommentieren. Er führt nur Code aus diesem Repo aus. |

Text aus dem Issue steht nie in einem `run:`-Schritt. Er läuft nur über Dateien oder Umgebungsvariablen, und die Skripte prüfen ihn streng (zum Beispiel die Issue-Nummer gegen `^[1-9][0-9]{0,8}$`). Alle Actions von Dritten sind auf einen Commit festgelegt.

Die Läufe für ein Issue brechen sich gegenseitig ab (`concurrency` je Issue). Das Schreiben auf `gh-pages` läuft in der Gruppe `gh-pages`, auch das Aufräumen. GitHub hält in einer Gruppe höchstens einen laufenden und einen wartenden Lauf. Kommen mehr, fällt der älteste wartende weg. Dann hilft eine Wiederholung (siehe unten). Schreibt jemand zwischen Lesen und Schreiben auf `gh-pages`, schlägt das Schreiben fehl (`--force-with-lease`) und wird bis zu fünfmal auf dem neuen Stand wiederholt.

## Ein Lauf wiederholen (workflow_dispatch) {#repeat}

Wer Schreibrechte hat, kann den Lauf für ein bestehendes Issue wiederholen, ohne die ZIP-Datei neu anzuhängen:

1. Öffne im Repo „Actions“ und wähle „Submission“.
2. Klicke auf „Run workflow“ und trage die Nummer des Issues ein (`issue`).

Eine Wiederholung baut immer neu, auch wenn ZIP-Adresse und Angaben gleich sind. Für einen Test ohne Browser nimmt die Eingabe `zip_url` die ZIP-Datei von einer Adresse statt aus dem Issue, mit denselben Grenzen und Prüfungen; erlaubt sind nur Adressen, die mit `https://raw.githubusercontent.com/lernapps/` oder `https://raw.githubusercontent.com/mrsimpson/test-lernkontrolle/` beginnen (`MAINTAINER_ZIP_PREFIXES` in `actions/lib/limits.ts`), und Anhänge von GitHub. Das Aufräumen lässt sich genauso von Hand starten. Es ist standardmäßig ein Trockenlauf: er zeigt in der Zusammenfassung, was er löschen würde, und ändert nichts. Mit `dry-run` aus löscht er wirklich; mit `issue` betrifft es nur ein Issue.

## Einstellungen im Repo (nur Verwaltende) {#settings}

- **Issues** eingeschaltet.
- **Pages**: Quelle „Deploy from a branch“, Branch `gh-pages`, Ordner `/ (root)`. Den Branch legt der erste Lauf von „Cleanup“ an (ohne `dry-run`) oder die erste Veröffentlichung. Erst danach ist die Auswahl möglich.
- **Pflichtprüfungen** auf `main`: `check` (check.yml) und `site` (pages.yml). Beide laufen immer und melden das Ergebnis.
- **Adresse**: Für ein Repo der Organisation `lernapps` liefert Pages `https://lernapps.net/practice/`. Das hängt an der Domain der Organisation (`lernapps.github.io`), nicht an diesem Repo.
- **Actions**: erlaubt; „Workflow permissions“ müssen nicht auf „Read and write“ stehen, die Workflows setzen ihre Rechte selbst.
- **Reaktionen**: Die Regel „👍 hält die Vorschau“ gilt für Reaktionen auf das Issue (das erste Feld), nicht auf Kommentare.

## Updates {#updates}

- Renovate (Voreinstellung aus `lernapps/tooling`) hebt die festgelegten Commits der Actions an, auch die der gemeinsamen Aktionen für die Seite (`site-check`, `site-deploy`, `site-preview`), den Rahmen `@lernapps/site` und `marked`.
- Den Stand der Vorlagen hebt niemand hier an. Der Bau liest bei jedem Lauf `appTemplates.commit` aus der `package.json` von `lernapps/tooling` auf `main`. So baut GitHub mit derselben Vorlage, mit der `create` die App beim Assistenten angelegt hat. Ebenso nimmt er `@lernapps/tooling` in diesem Commit von `main`. `npm run try -- <zip> --commit <sha>` probiert einen anderen Stand der Vorlage lokal aus.

## Missbrauch und Grenzen {#abuse}

Jedes GitHub-Konto kann ein Issue anlegen und damit einen Lauf starten. Das schützt nur die Menge der Grenzen: kleine Dateien, kurze Läufe, getrennte Rechte. Wer das Repo pflegt, schließt oder sperrt Issues, die offensichtlich Unsinn sind. Geschlossene Issues verlieren ihre Vorschau sofort.

## Fehler suchen {#errors}

| Bild | Ursache |
| --- | --- |
| Kein Kommentar, Lauf „Submission“ grün | Das Issue stammt nicht aus dem Formular (eine Überschrift fehlt), oder ZIP-Adresse und Angaben sind gleich wie beim letzten Lauf. Das Protokoll von `intake` sagt es. |
| `publish` rot: „cannot push gh-pages“ | Mehrere Läufe gleichzeitig. Wiederholen. |
| Kommentar „Falls die Seite noch nicht lädt“ | Pages hat den Stand noch nicht ausgeliefert. Meist nach wenigen Minuten da. Prüfe die Pages-Einstellung. |
| `build` rot bei `pin` | `https://raw.githubusercontent.com/lernapps/tooling/main/package.json` war nicht lesbar oder enthält keinen gültigen `appTemplates.commit`. Wiederholen; sonst das Tooling prüfen. |
| `build` rot bei `npm ci` | Die Lock-Datei der Vorlage passt nicht zum Stand. Prüfe `appTemplates.commit` im Tooling. |
