# practice

Vorübergehende Vorschauen für Lern-Apps: Eltern oder Schüler reichen den Quelltext einer Lern-App (Archetyp `explainer`) als ZIP-Datei über ein Issue-Formular ein. Ein Workflow baut daraus auf GitHub eine Vorschau unter `https://lernapps.net/practice/i/<Issue-Nummer>/`, schreibt den Link in einen Kommentar und räumt die Vorschau nach 14 Tagen ab. Der Lernstand der Kinder bleibt im Browser und ist nie Teil des Inhalts.

Das Repo enthält keine Apps und keine Laufzeit. Es gehört zur Plattform [lernapps.net](https://lernapps.net/); die Vorlagen kommen aus [lernapps/app-templates](https://github.com/lernapps/app-templates), die Regeln und Prüfungen aus [lernapps/tooling](https://github.com/lernapps/tooling).

## Wohin?

- **Einreichen:** [Formular öffnen](https://github.com/lernapps/practice/issues/new?template=einreichen.yml), Anleitung in [docs/einreichen.md](docs/einreichen.md).
- **Dokumentation (Deutsch):** [docs/index.md](docs/index.md). Sie nennt Regeln, Prüfungen, Datenschutz und Lebensdauer.
- **Für KI-Assistenten:** [docs/llms.txt](docs/llms.txt).
- **Betrieb und Einstellungen:** [docs/betrieb.md](docs/betrieb.md).

## Was im Repo liegt

- `docs/`: Dokumentation für Menschen und `llms.txt`.
- `.github/ISSUE_TEMPLATE/einreichen.yml`: das Formular.
- `.github/workflows/`: dünne Workflows `einreichung.yml`, `aufraeumen.yml` und `check.yml`.
- `actions/`: die Composite-Actions `validate` (prüfen), `build` (bauen), `publish` (veröffentlichen), `expire` (ablaufen lassen) und der gemeinsame Code in `actions/lib/`.
- `test/`: Tests der Skripte mit `node:test`.

## Mitarbeiten

`npm test` führt alle Tests aus (Node 22.18 oder neuer, keine Abhängigkeiten). Die Tests prüfen unter anderem gute und böse ZIP-Dateien, den Ablauf mit einem lokalen Git-Remote und die Regeln des Aufräumens. `AGENTS.md` nennt die Regeln für Assistenten.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
