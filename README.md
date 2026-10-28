# practice

lernapps.net bietet zwei Wege: **Lernen** mit den dauerhaften Apps im [Katalog](https://lernapps.net/apps/) und **Üben** für einen Anlass, etwa die nächste Arbeit. Dieses Repo ist der Weg zum Üben. Der KI-Assistent eines Creators macht aus Fotos von Schulmaterial eine App zum Üben nach Maß (Archetyp `explainer`). Der Creator reicht sie als ZIP-Datei über ein Issue-Formular ein. Ein Workflow veröffentlicht sie unter `https://lernapps.net/practice/i/<Issue-Nummer>/` und räumt sie nach 14 Tagen ab.

Das Repo enthält keine Apps und keine Laufzeit. Die Vorlagen kommen aus [lernapps/app-templates](https://github.com/lernapps/app-templates), die Regeln und Prüfungen aus [lernapps/tooling](https://github.com/lernapps/tooling).

## Einstieg

- **Für Creator:** <https://lernapps.net/practice/>, Quelle in [docs/index.md](docs/index.md) und [docs/en/index.md](docs/en/index.md).
- **Für KI-Assistenten:** [docs/llms.txt](docs/llms.txt). Sie führt zur Plan-Vorlage [guidance/plan-template.md](guidance/plan-template.md) und zu den Skills in `skills/`.
- **Einreichung und Vorschau:** `.github/workflows/` und die Composite-Actions in `actions/`.
- **Betrieb:** [docs/operations.md](docs/operations.md). **Architektur:** [docs/arc42/](docs/arc42/). **Bewertung der Anleitung:** [docs/evaluation.md](docs/evaluation.md).

## Mitarbeiten

- `npm test`: alle Tests (Node 22.18 oder neuer).
- `npm ci && npm run build && npm run check`: die Seite bauen und prüfen.
- `npm run try -- <zip>`: eine ZIP-Datei lokal prüfen und bauen.

`AGENTS.md` nennt die Regeln für Assistenten.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
