# practice

Vorübergehende Vorschauen für Lern-Apps: Eltern oder Schüler reichen den Quelltext einer Lern-App (Archetyp `explainer`) als ZIP-Datei über ein Issue-Formular ein. Ein Workflow baut daraus auf GitHub eine Vorschau unter `https://lernapps.net/practice/i/<Issue-Nummer>/`, schreibt den Link in einen Kommentar und räumt die Vorschau nach 14 Tagen ab. Die App speichert nichts über das Kind.

Das Repo enthält keine Apps und keine Laufzeit. Es gehört zur Plattform [lernapps.net](https://lernapps.net/); die Vorlagen kommen aus [lernapps/app-templates](https://github.com/lernapps/app-templates), die Regeln und Prüfungen aus [lernapps/tooling](https://github.com/lernapps/tooling).

## Wohin?

- **Einreichen:** [Formular öffnen](https://github.com/lernapps/practice/issues/new?template=einreichen.yml), Anleitung in [docs/einreichen.md](docs/einreichen.md).
- **Dokumentation:** <https://lernapps.net/practice/> (Deutsch) und <https://lernapps.net/practice/en/> (English). Die Quellen: [docs/index.md](docs/index.md) und [docs/en/index.md](docs/en/index.md).
- **Für KI-Assistenten:** [docs/llms.txt](docs/llms.txt) ist der Einstieg für jeden Assistenten. Sie entsteht aus den Skills in [skills/](skills/) (siehe [Skills installieren](#skills-installieren)).
- **Betrieb und Einstellungen:** [docs/betrieb.md](docs/betrieb.md).

## Was im Repo liegt

- `skills/`: drei Skills für Assistenten (`lernapps-practice`, `lernapps-practice-photos`, `lernapps-practice-explainer`), aus denen `docs/llms.txt` entsteht.
- `docs/`: Dokumentation für Menschen (Deutsch in `docs/*.md`, Englisch in `docs/en/*.md`) und `llms.txt`.
- `docs/arc42/`: die Architektur des Repos als arc42-Modell (nur Englisch), veröffentlicht unter <https://lernapps.net/practice/architecture/>.
- `scripts/` und `site/`: Bauskript und Stil der Seite, `scripts/llms.mjs` (setzt `docs/llms.txt` aus den Skills zusammen) und `scripts/try.ts` (Probelauf eines ZIP).
- `.github/ISSUE_TEMPLATE/einreichen.yml`: das Formular.
- `.github/workflows/`: dünne Workflows `einreichung.yml`, `aufraeumen.yml`, `check.yml`, `pages.yml` (Seite bauen, prüfen, veröffentlichen) und `pr-preview.yml` (Vorschau je Pull Request).
- `actions/`: die Composite-Actions `validate` (prüfen), `build` (bauen), `publish` (veröffentlichen), `expire` (ablaufen lassen) und der gemeinsame Code in `actions/lib/`.
- `test/`: Tests der Skripte mit `node:test`.

## Skills installieren

Die Skills liegen wie die des Tooling nach Aufgabe geordnet in `skills/process/` und `skills/content/`. Ein Skill-Installer liest sie direkt aus diesem Repo:

```text
npx --yes skills add lernapps/practice -y -s lernapps-practice
npx --yes skills add lernapps/practice -y -s lernapps-practice-photos
npx --yes skills add lernapps/practice -y -s lernapps-practice-explainer
```

Der Einstieg für jeden Assistenten bleibt die [llms.txt](https://lernapps.net/practice/llms.txt): Sie enthält alle drei Skills in einem Dokument, ohne Verweis auf eine weitere Datei. Wer ein Skill ändert, führt `npm run llms` aus und committet `docs/llms.txt` mit. Wie man die Anleitung testet, steht in [docs/anleitung-testen.md](docs/anleitung-testen.md).

## Mitarbeiten

`npm test` führt alle Tests aus (Node 22.18 oder neuer, keine Abhängigkeiten). Die Seite baut man mit `npm ci && npm run build` und prüft sie mit `npm run check`; ein lokaler Blick: `SITE_PATH_PREFIX=/ npm run build && python3 -m http.server -d _site 8000`. Die Tests prüfen unter anderem gute und böse ZIP-Dateien, den Ablauf mit einem lokalen Git-Remote und die Regeln des Aufräumens. `npm run try -- <zip>` schickt eine ZIP-Datei lokal durch Prüfung und Bau der Actions. `AGENTS.md` nennt die Regeln für Assistenten.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
