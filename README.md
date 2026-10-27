# practice

Eine Arbeit steht an, und keine App im Katalog passt? Dann macht der KI-Assistent der Eltern aus Fotos von Schulmaterial in Minuten eine kleine Lern-App nach Maß, die zwei Wochen lang vorübergehend erreichbar ist. Technisch reichen Eltern oder Schüler den Quelltext einer Lern-App (Archetyp `explainer`) als ZIP-Datei über ein Issue-Formular ein; ein Workflow baut daraus auf GitHub eine Vorschau unter `https://lernapps.net/practice/i/<Issue-Nummer>/`, schreibt den Link in einen Kommentar und räumt die Vorschau nach 14 Tagen ab. Die App speichert nichts über das Kind.

Das Repo enthält keine Apps und keine Laufzeit. Es gehört zur Plattform [lernapps.net](https://lernapps.net/); die Vorlagen kommen aus [lernapps/app-templates](https://github.com/lernapps/app-templates), die Regeln und Prüfungen aus [lernapps/tooling](https://github.com/lernapps/tooling).

## Wohin?

- **Einreichen:** [Formular öffnen](https://github.com/lernapps/practice/issues/new?template=einreichen.yml), Anleitung in [docs/einreichen.md](docs/einreichen.md).
- **Dokumentation:** <https://lernapps.net/practice/> (Deutsch) und <https://lernapps.net/practice/en/> (English). Die Quellen: [docs/index.md](docs/index.md) und [docs/en/index.md](docs/en/index.md).
- **Für KI-Assistenten:** [docs/llms.txt](docs/llms.txt) ist der Einstieg. Sie führt zur Plan-Vorlage [guidance/plan-template.md](guidance/plan-template.md), der der Assistent folgt (siehe [Skills](#skills)).
- **Betrieb und Einstellungen:** [docs/betrieb.md](docs/betrieb.md).

## Was im Repo liegt

- `guidance/plan-template.md`: die Plan-Vorlage mit den Phasen Explore, Plan, Code und Commit.
- `skills/`: drei Skills für Assistenten (`lernapps-practice-explore`, `lernapps-practice-photos`, `lernapps-practice-submit`).
- `docs/`: Dokumentation für Menschen (Deutsch in `docs/*.md`, Englisch in `docs/en/*.md`) und `llms.txt`.
- `docs/arc42/`: die Architektur des Repos als arc42-Modell (nur Englisch), veröffentlicht unter <https://lernapps.net/practice/architecture/>.
- `scripts/` und `site/`: Bauskript und Stil der Seite und `scripts/try.ts` (Probelauf eines ZIP).
- `.github/ISSUE_TEMPLATE/einreichen.yml`: das Formular.
- `.github/workflows/`: dünne Workflows `einreichung.yml`, `aufraeumen.yml`, `check.yml`, `pages.yml` (Seite bauen, prüfen, veröffentlichen) und `pr-preview.yml` (Vorschau je Pull Request).
- `actions/`: die Composite-Actions `validate` (prüfen), `build` (bauen), `publish` (veröffentlichen), `expire` (ablaufen lassen) und der gemeinsame Code in `actions/lib/`.
- `test/`: Tests der Skripte mit `node:test`.

## Skills

Ein Assistent mit Shell (Node 22, git, Netz) baut die App beim Creator. Der Einstieg ist die [llms.txt](https://lernapps.net/practice/llms.txt): Sie lässt ihn die Plan-Vorlage herunterladen. Die Vorlage folgt den Phasen des Tooling und installiert genau diese Skills:

- aus diesem Repo (`skills/process/` und `skills/content/`): `lernapps-practice-explore` (Explore), `lernapps-practice-photos` (Explore und Code), `lernapps-practice-submit` (Commit);
- aus `lernapps/tooling`: `lernapps-explainer`, `lernapps-explainer-design`, `lernapps-content-questions`, `lernapps-exercise-patterns`, `lernapps-content-research`, `lernapps-check`.

Dann legt `npx --yes github:lernapps/tooling#main create --archetype explainer` die App an, mit dem Inhaltsleitfaden `app-content`. Wie man die Anleitung testet, steht in [docs/anleitung-testen.md](docs/anleitung-testen.md).

## Mitarbeiten

`npm test` führt alle Tests aus (Node 22.18 oder neuer, keine Abhängigkeiten). Die Seite baut man mit `npm ci && npm run build` und prüft sie mit `npm run check`; ein lokaler Blick: `SITE_PATH_PREFIX=/ npm run build && python3 -m http.server -d _site 8000`. Die Tests prüfen unter anderem gute und böse ZIP-Dateien, den Ablauf mit einem lokalen Git-Remote und die Regeln des Aufräumens. `npm run try -- <zip>` schickt eine ZIP-Datei lokal durch Prüfung und Bau der Actions. `AGENTS.md` nennt die Regeln für Assistenten.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
