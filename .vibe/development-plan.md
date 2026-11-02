# Development Plan: practice (main branch)

*Generated on 2026-11-01 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Alles, was die Assistenten der Creator brauchen, soll als npm-Paket erscheinen. Dazu gehören `practice` (Skills, Plan-Template, `llms.txt`) und `../tooling`. Vorher prüfen wir die Code-Organisation beider Repos: Was gehört in welches Paket, und was bleibt im Repo?

## Key Decisions
- KD-01: Drei Pakete: `@lernapps/app-templates`, `@lernapps/tooling`, `@lernapps/practice`. `docs` und `apps` bleiben Web-Seiten.
- KD-02: Scope `@lernapps` bei npm; es ist noch nichts veröffentlicht.
- KD-03: Die erste Veröffentlichung läuft lokal (`npm publish`), denn auch GitHub Actions können das noch nicht. Danach wird Provenance eingeschaltet (Trusted Publishing aus CI).
- KD-04: Wer eine App baut, soll nach der Umstellung keine Abhängigkeit mehr von GitHub-URLs, `curl` auf `raw.githubusercontent.com` oder `github:`-Pins haben. Alles kommt aus der npm-Registry.
- KD-05: Das Plan-Template per HTTP abzurufen hat bei Assistenten nicht zuverlässig funktioniert: Alle 33 Läufe der Eval vom 2026-10-18 lasen Guidance über ein zusammenfassendes Fetch-Werkzeug (`tooling/evals/runs/2026-10-18-first-run/conclusions.yaml`, `summary-fetches`). Ein Paket liefert die Datei Byte für Byte per `npx`, ohne Zusammenfassung.
- KD-06: Die vier `practice`-Skills werden mit `practice` gebündelt und bleiben dort. `@lernapps/practice` verhält sich als Ergänzung zu `@lernapps/tooling` (gleiche Form: `bin`, `exports`, `files`, Skills und Guidance im Paket).
- KD-07: `practice/actions/` ist Teil der Auslieferung (Einreichung validieren, bauen, veröffentlichen) und kommt nicht ins Paket. Was wir für die eigene Erstellung brauchen, liegt in `.github/` (Workflows) und bleibt ebenfalls draußen.
- Skills-Installation künftig (Recherche in `skills@1.7.4`): `npx skills experimental_sync` liest Skills aus `node_modules` (`skills/<name>/SKILL.md` oder `dist/skills/<name>/SKILL.md`, eine Ebene tief) und verlinkt sie nach `.agents/skills/` und in die gewählten Agent-Verzeichnisse (`-a`, auch mehrere); es führt `skills-lock.json` und räumt Entferntes ab. Das ist der npm-Weg desselben Werkzeugs und bleibt so Mehr-Agenten-fähig. Die Skills müssen dafür Abhängigkeiten im `package.json` des Projekts sein. Hürden: (a) das Verfahren ist als „experimental“ markiert; (b) unsere Skills liegen in `skills/<gruppe>/<name>/`, also zwei Ebenen tief, und würden nicht gefunden: Lösung entweder flaches Layout im Paket oder `dist/skills/<name>/` beim Packen; (c) von den Archetyp-Skills soll nur der des gewählten Archetyps ankommen (`--include`/`--exclude` oder die CLI wählt).
- KD-08: `tooling` und `practice` folgen demselben Ablauf (Nutzer: „das sollte genau so funktionieren“). Heutiger Ablauf von `tooling` (`generator/create.ts`, `guidance/plan-template.md`, Skill `lernapps-cli`): Plan-Template per `curl`; Skills in Etappen per `npx skills add lernapps/tooling -s …` (Explore-Skills, nach der Wahl des Archetyps dessen Skills); nach dem Ja des Creators `npx github:lernapps/tooling#main create --archetype <name>`, das die Vorlage aus `lernapps/app-templates` beim gepinnten Commit kopiert und die App an die Runtime `@lernapps/app-templates` desselben Commits bindet (git-Abhängigkeit). Danach bleibt die App an Commits gepinnt: `npm update` ändert nichts, `lernapps update` zieht nach. Künftig: Plan-Template und Skills kommen aus dem Paket (`init` + `skills experimental_sync`, Archetyp-Skills erst nach der Wahl), `create` kopiert die Vorlage aus dem installierten `@lernapps/app-templates` (exakte Version als Abhängigkeit von `tooling`, damit Vorlage und Runtime zusammenpassen), und die App hängt von Versionen statt Commits ab, sodass `npm update` greift.
- Dadurch zu ändern in `create`: Es verlangt heute einen leeren Ordner außer `.git`, Plan und Skills; `init` legt zusätzlich `package.json` an, das `create` übernehmen und ergänzen muss. Außerdem: `appTemplates.commit`/`archetypes` in `tooling/package.json` entfallen zugunsten einer Version; die Tests und `practice/actions/build` (liest das Pin per HTTP) ziehen nach.
- KD-09: `tooling` bietet das `init` (Plan-Template aus dem Paket, `package.json`, Installation, `skills experimental_sync`); `practice` ruft es mit eigenem Template und eigenen Skills auf (`lernapps-practice init` ist dünn).
- KD-10: Die Skills stehen im Paket unter `dist/skills/<name>/` (flach, für `skills experimental_sync`); die Quellordner `skills/<gruppe>/<name>/` bleiben unverändert und der Build kopiert sie.
- Offen: Was genau in welches Paket kommt (Vorschlag unter Notes); wie Skills ohne `npx skills add <GitHub-Repo>` installiert werden; wie die `llms.txt` auf Versionen verweist.

## Notes
- Workflow: epcc. Der Start war mehrdeutig; die Rückfrage zu Name, Inhalt und Release ist offen und wird nach der Erkundung gestellt.
- `practice/package.json` ist `private: true`; Actions, Site und arc42-Doku gehören nicht in ein Creator-Paket.
- Gefunden in `practice`: `skills/` (vier Skills), `guidance/plan-template.md`, `docs/llms.txt`.
- `../tooling` ist schon als npm-Paket `@lernapps/tooling` geschnitten (`bin: lernapps`, `exports`, `files`, `prepare: vp pack`), `version` 0.0.0, aber bewusst nur aus git installiert. ADR `dec-one-package` (docs/arc42/09) und Risiko in docs/arc42/11 sehen die Veröffentlichung unter dem reservierten Scope `@lernapps` vor, „wenn Installationszeit oder Größe weh tun“.
- `../app-templates` ist ein dritter Baustein: `@lernapps/app-templates` (Runtime je Archetyp), ebenfalls nur aus git; `tooling` pinnt es als `appTemplates.commit`, und `lernapps create` holt es von GitHub.
- `practice` hängt an `tooling` über: `npx skills add lernapps/tooling` und `npx --yes github:lernapps/tooling#main create` im Plan-Template, das Pin-Lesen in `actions/build/build.ts` (package.json von `lernapps/tooling` auf main), den `useTooling`-Install mit `github:lernapps/tooling#<sha>`, Renovate-Preset `github>lernapps/tooling`.
- npm-Stand: weder `@lernapps/tooling` noch `lernapps-practice` ist veröffentlicht; `npm whoami` meldet keine Anmeldung auf diesem Rechner.
- So leiten wir den Creator heute (`../docs`, `../apps`, `../tooling`, `practice`): Der Creator gibt dem Assistenten eine Web-Seite (`lernapps.net/apps/build/` oder `/practice/`). Der Assistent liest die `llms.txt` (`apps/src/llms.njk`, `practice/docs/llms.txt`), holt per `curl` das Plan-Template von `raw.githubusercontent.com` und folgt ihm. Das Template lädt die Skills mit `npx skills add lernapps/tooling` und legt die App mit `npx github:lernapps/tooling#main create` an. Alles läuft über URLs und git-Refs auf `main`, nichts über die npm-Registry.
- `../docs` führt die Plattform-Doku (pdt42, biz42, arc42); der Dienst für Creator ist dort `t-build-with-assistant` (D6). Es liefert den Skill `pdt` (`npx skills add lernapps/docs`) und listet die `llms.txt` der anderen Repos. Für Creator-Assistenten ist `docs` nur Hintergrund, kein Laufzeit-Bestandteil.
- `../apps` ist der Katalog plus die Listing-Wege (`lernapps-listing`-Skill, Eintrag, Prüfung, Review). Es verweist auf `tooling` über `src/_data/site.js` (`create`, `skill`, `listing` als feste GitHub-URLs auf `main`). Diese URLs würden bei Paketen mit Versionen stabiler.
- Es gibt also drei Wege, wie ein Creator-Assistent Material bekommt: (1) `llms.txt` und Plan-Template per URL, (2) Skills über den `skills`-Installer aus einem GitHub-Repo, (3) die CLI `lernapps` per `npx github:`. Ein npm-Paket ersetzt vor allem (2) und (3); (1) bleibt eine Web-Seite, kann aber auf eine Paketversion verweisen.
- Weitere git-Abhängigkeiten, die KD-04 berührt: `app-templates/{explainer,interactive,quiz}/package.json` hängen an `github:lernapps/tooling#<sha>`; `tooling` pinnt `app-templates` als `appTemplates.commit` und `create` lädt es von GitHub; `practice/actions/build` liest das Pin von `raw.githubusercontent.com` und installiert `@lernapps/tooling@github:…`; `@lernapps/site` ist in allen Repos ein `github:`-DevDependency (nur für Sites, nicht für den Builder).
- Vorschlag für den Inhalt (noch nicht bestätigt):
  - `@lernapps/app-templates`: `explainer/`, `interactive/`, `quiz/` (Vorlagen) und `runtime/`. Die Vorlagen hängen von `@lernapps/tooling` per Version ab, nicht per Commit.
  - `@lernapps/tooling`: CLI `lernapps`, Skills, Guidance (Plan-/Increment-Template, Schemas), Preset, `check`, `review/`. Hängt von `@lernapps/app-templates` ab, sodass `create` ohne GitHub arbeitet. Kein Teil: `actions/`, `evals/`, `docs/`, `site/` (Plattform-Pflege).
  - `@lernapps/practice`: Plan-Template, die vier Skills und eine kleine CLI (`init`), die das Template unverändert nach `.vibe/plans/` schreibt und die Skills ins Projekt legt. Kein Teil: `actions/`, `site/`, `docs/`, `test/`.
  - Zyklus: `tooling` hängt von `app-templates` ab, und die Vorlagen-`package.json` nennen `tooling`. Das ist kein npm-Zyklus, solange diese Dateien nur Daten im Paket sind; beim Veröffentlichen muss die Reihenfolge stimmen (app-templates mit Platzhalter-Version, dann tooling, dann Vorlagen-Pin).
- Folge für die Organisation: Die Creator-Skills und -Guidance liegen auf zwei Repos verteilt (`practice` hat vier, `tooling` den Rest). Ein Paket nur aus `practice` wäre unvollständig. Ein Paket, das alles enthält, braucht eine feste Reihenfolge (app-templates → tooling → practice) und Versionen statt Git-Commits als Pin.

## Explore
Eintrittskriterium: Plan-Datei und Ziel stehen (erfüllt).
Eintrittskriterium Plan: Die Struktur von `practice` und `../tooling` ist verstanden, und die offenen Entscheidungen liegen beim Nutzer.
Eintrittskriterium Code: Der Nutzer hat den Plan bestätigt.
Eintrittskriterium Commit: Build, Tests und `npm pack --dry-run` laufen für beide Pakete sauber.

### Tasks
- [x] `../tooling` erkunden: Aufbau, Exporte, Abhängigkeiten, Verbraucher
- [x] Prüfen, wie `practice` und `tooling` heute zusammenhängen (Verweise wie `@lernapps/tooling/guidance/...`)
- [x] `../app-templates` als dritten Baustein einordnen
- [x] `../docs` und `../apps` lesen: wie der Creator heute geleitet wird
- [x] Offene Entscheidungen beim Nutzer erfragen (Zuschnitt, Scope, Release, Reichweite): beantwortet, siehe Key Decisions
- [x] Skill-Installation ohne GitHub: Weg über `skills experimental_sync` recherchiert
- [x] `tooling`-Ablauf mit mehreren Archetypen verstanden (create, Skills in Etappen, Pins)
- [x] Mit dem Nutzer geklärt: Skill-Layout (`dist/skills/`), ein `init` in `tooling` für beide
- [x] Version-Pins: Abhängigkeiten per Version statt Commit (KD-04, KD-08)
- [x] Vorschlag für Paketzuschnitt und Code-Organisation formulieren (siehe Notes, KD-01 bis KD-10)

### Completed
- [x] Created development plan file

## Plan
Strategie: Von unten nach oben bauen und veröffentlichen, in der Reihenfolge der Abhängigkeiten. Jedes Paket wird erst als Tarball (`npm pack`) in einem leeren Ordner geprüft, bevor es mit `npm publish` hinausgeht. Veröffentlichte Versionen lassen sich nach 72 Stunden nicht mehr zurückziehen, daher beginnt jedes Paket bei `0.1.0` und erst die Ende-zu-Ende-Probe entscheidet über die Veröffentlichung. Je Repo ein Feature-Branch, vor dem Merge zusammengefasst (squash); `.vibe` wird mit committet.

Reihenfolge und Abhängigkeiten: `app-templates` (keine Abhängigkeit auf unsere Pakete) → `tooling` (hängt exakt von `app-templates` ab) → `practice` (hängt von `tooling` ab) → `apps` und Doku (verweisen nur). Das erste Mal läuft lokal (KD-03); danach Trusted Publishing mit Provenance.

Eintrittskriterium Code: Der Nutzer bestätigt diesen Plan.

### Tasks
- [x] Reihenfolge, Abhängigkeiten und Stufen festlegen (siehe Code)
- [x] Risiken und Gegenmaßnahmen festhalten (unten, Notes)
- [ ] Nutzer bestätigt den Plan (offene Fragen unten)

Offene Fragen an den Nutzer:
1. Besitzt der Nutzer den npm-Scope `@lernapps` und ist 2FA-Veröffentlichung auf diesem Rechner möglich (`npm login`)? Bisher meldet `npm whoami` keine Anmeldung.
2. Startversion `0.1.0` für alle drei Pakete, danach SemVer: einverstanden?
3. Die Skills der Gruppe `archetypes/` erscheinen im Paket je Archetyp getrennt (`lernapps-explainer`, `lernapps-explainer-design`, …), und `init` synchronisiert sie erst nach der Wahl des Archetyps: einverstanden?

Risiken:
- `skills experimental_sync` ist experimentell: `skills` exakt pinnen, ein Test sichert Auffinden, Verlinken und Filter ab.
- Namen oder Scope nicht verfügbar: früh prüfen (Stufe 0).
- Bestehende Apps hängen an Git-Pins: `lernapps update` muss sie auf Versionen umstellen, und der alte Weg (`github:`) bleibt bis dahin bestehen.
- Zyklus `app-templates` ↔ `tooling` durch die Vorlagen-`package.json`: sie nennen `tooling` nur als Daten; `create` schreibt die Version des laufenden `tooling` ein.
- Eine Veröffentlichung ist nicht rücknehmbar: Tarball-Probe und Evals (`tooling/evals`) vorher.

### Completed
*None yet*

## Code
Je Stufe: eigener Feature-Branch im jeweiligen Repo, Tests grün, `npm pack --dry-run` zeigt nur gewollte Dateien.

### Tasks
- [x] Stufe 0, Vorbereitung (2026-11-01, auf Wunsch des Nutzers schon in der Plan-Phase): Angemeldet als `mrsimpson`, Owner der Org `lernapps`. Die drei Pakete `@lernapps/app-templates`, `@lernapps/tooling`, `@lernapps/practice` existieren bei npm als Platzhalter `0.0.0-stage` („Temporary package placeholder for staged publishing“, vom Nutzer angelegt; `npm view` meldet deshalb 404, `npm access list packages @lernapps` zeigt alle drei als `read-write`). Eigene Platzhalter `0.0.1` wurden nicht gebraucht und nicht veröffentlicht.
- [x] Stufe 5, Teil 1: Trusted Publisher per `npm trust github` gesetzt: je Paket Repo `lernapps/<paket>`, Workflow `release.yml`, Rechte „publish, stage publish“ (IDs: app-templates 42fce2e3…, tooling a2571866…, practice 2161d0b5…).
- [~] Stufe 1 Stand (2026-11-01): Branch `feat/npm-package` in `../app-templates` mit `release.yml`, `scripts/pack-dotfiles.ts` (npm lässt `.gitignore` und `.npmrc` weg: `prepack` legt `_gitignore` an, `create` stellt es wieder her), Version `0.1.0`, README. PR lernapps/app-templates#116, alle CI-Checks grün. **Offen: Merge und Tag `v0.1.0`.** Der Merge wurde vom Berechtigungs-Klassifikator abgelehnt („Merge Without Review“); der Nutzer muss mergen oder es ausdrücklich erlauben. Die Vorlagen führen `@lernapps/tooling` vorerst weiter als Git-Pin; sie wechseln auf die Version, sobald `tooling` 0.1.0 veröffentlicht ist.
- [~] Stufe 2 Stand (2026-11-01): Branch `feat/npm-package` in `../tooling`, ein Checkpoint-Commit plus ungesicherte Änderungen. Fertig und gegen eine lokale Registry (Verdaccio, Tarballs von `app-templates` und `tooling`) erprobt: `lernapps init <name> [--addon]` (Plan-Template unverändert aus dem Paket, `skills experimental_sync --copy` ohne Archetyp-Skills), `lernapps skills --archetype <name>`, `create` aus dem installierten `@lernapps/app-templates` (Versionen statt Commits, `_gitignore` → `.gitignore`, übernimmt die `package.json` von `init`), `update` mit Versionsbereichen und Action-Tag `v<version>`, `scripts/dist-skills.ts` (`dist/skills/<name>/`), `release.yml`, Texte in Guidance, Skills, README und `site/llms.txt`. Unit-Tests grün (310 von 313; die 3 Ausnahmen: `site-pre-push` scheitert auch auf `main`, ein `app-preview`-Test lief in ein Timeout, `release.yml`-Test ist angepasst). **Offen:** `test/create.e2e.test.ts`, `evals/` und `test/evals.test.ts` (prüfen noch `npx github:lernapps/tooling#main create`), `test/rules-scope.test.ts`; `package-lock.json` neu erzeugen, sobald `app-templates` 0.1.0 veröffentlicht ist; arc42 und Site-Doku von `tooling`.
- [ ] Stufe 1, `app-templates` (Ausgangsaufgabe): `files` um die Archetyp-Ordner erweitern (`explainer`, `interactive`, `quiz`, ohne Tests und Doku); `package.json` der Vorlagen führt `@lernapps/tooling` als Platzhalter statt `github:…#sha`; Version `0.1.0`; `npm pack` im leeren Ordner prüfen; veröffentlichen.
- [ ] Stufe 2, `tooling`:
  - [ ] `dependencies` um `@lernapps/app-templates` (exakt) erweitern; `appTemplates.commit`/`archetypes` entfernen
  - [ ] Build kopiert die Skills nach `dist/skills/<name>/` (flach) und nimmt sie in `files` auf
  - [ ] `lernapps init` (Plan-Template aus dem Paket, `package.json`, `skills` pinnen, `skills experimental_sync`, Archetyp-Skills erst nach der Wahl)
  - [ ] `create` kopiert die Vorlage aus dem installierten `@lernapps/app-templates`, erlaubt eine vorhandene `package.json`, schreibt Versionen statt Commits in die App
  - [ ] `update` stellt Apps mit Git-Pin auf Versionen um
  - [ ] Skills, Plan-Template, `llms.txt`, README und arc42 (Entscheidung `dec-one-package`, Bereitstellung) auf `npx @lernapps/tooling …` umstellen
  - [ ] Tests anpassen; Tarball-Probe im leeren Ordner für alle drei Archetypen; veröffentlichen
- [ ] Stufe 3, `practice`:
  - [ ] `package.json`: `@lernapps/practice`, nicht privat, `bin` `lernapps-practice`, `files` (Skills nach `dist/skills/`, Plan-Template, `llms.txt`), Abhängigkeit auf `@lernapps/tooling`
  - [ ] `lernapps-practice init` ruft das `init` von `tooling` mit eigenem Template und eigenen Skills auf
  - [ ] Plan-Template und `docs/llms.txt`: `curl` und `npx skills add`/`github:` ersetzen
  - [ ] `actions/build/build.ts`: Pin aus `package.json` (Version) statt HTTP und `github:`-Installation; Tests und `test/guide.test.ts` anpassen
  - [ ] arc42 und README anpassen; Tarball-Probe; veröffentlichen
- [ ] Stufe 4, `apps`, `docs` und Site (Definition of Done laut Nutzer: erst fertig, wenn Site und Docs angepasst sind). Fundstellen von `github:lernapps`, `skills add`, `raw.githubusercontent.com/lernapps`:
  - [ ] `apps`: `src/_data/site.js` (`create`, `skill`, `listing`), `src/llms.njk`, `README.md`
  - [ ] `docs`: `site/llms.txt`, `package.json`, arc42 (Bausteine, Entscheidungen zur Bereitstellung), pdt42-Hinweise, falls sie den Weg nennen
  - [ ] `lernapps.github.io`: `src/llms.txt`, `site-frame/README.md` (Startseite und gemeinsame Seiten)
  - [ ] `tooling`: `site/llms.txt`, `README.md`, Site-Seiten, arc42
  - [ ] `practice`: `docs/llms.txt`, `docs/operations.md`, `docs/evaluation.md` (de und en), `docs/arc42/05-building-blocks.arc42.md`, `README.md`
  - [ ] Jede Site läuft durch `npm run build` und `npm run check`
- [x] Stufe 5, Teil 1b (2026-11-01, auf Wunsch des Nutzers): Rulesets angelegt. `practice`: `main` (Pull Request, 0 Reviews, Pflicht-Checks `check` und `site`, kein Force-Push, kein Löschen, Bypass nur Org-Admin; ID 26305693). Tag-Schutz `release-tags` für `refs/tags/v*` (nur Org-Admin darf anlegen, ändern, löschen) in `app-templates` (26305695), `tooling` (26305696) und `practice` (26305697). `app-templates` hat weiter keine Pflicht-Checks.
- [ ] Stufe 5, Release-Weg: Der Nutzer nutzt in `codemcp/knowledge` ein Release auf Push nach `main` mit semantic-release, einem GitHub-App-Token (`push-to-protected-mrsimpson`, ID 1493907, Bypass) und Trusted Publishing. Offen: diesen Weg statt des Tag-Workflows übernehmen. Voraussetzungen: App in der Org `lernapps` installieren (dort sind nur `claude`, `renovate`, `lernapps-publisher`, `lernapps-updater` installiert), App als Bypass-Akteur in `main` und `release-tags` eintragen, Variable `VERSION_BUMPER_APPID` und Secret `VERSION_BUMPER_SECRET` anlegen, Startversion klären (semantic-release beginnt bei 1.0.0, wenn kein `v0.x`-Tag existiert).
- [x] Stufe 5, Start-Tags (2026-11-01): `v0.0.0` auf dem damaligen `main` von `app-templates` (29cd654), `tooling` (15c6e59) und `practice` (a89b3b5) gesetzt, damit `semantic-release` bei `feat` mit `0.1.0` beginnt. Die App `push-to-protected-mrsimpson` ist für alle Repos der Org installiert; Variablen sind laut Nutzer gesetzt (mit meinem Token nicht lesbar).
- [ ] Offen, braucht den Nutzer: App als Bypass-Akteur (`Integration`, ID 1493907, `always`) in die sechs Rulesets eintragen (`main` und `release-tags` je Repo). Der Versuch per API wurde vom Berechtigungs-Klassifikator abgelehnt („Permission Grant“); ohne den Eintrag kann `semantic-release` weder die Version nach `main` noch den Tag schreiben.
- [x] Bypass der App `push-to-protected-mrsimpson` in allen sechs Rulesets: vom Nutzer eingetragen und per API gegengelesen.
- [x] Release-Weg (Entscheidung des Nutzers: automatisch bei Push nach `main`, nicht manuell): `semantic-release@25.0.9` (`.releaserc.json`, `release.yml` mit `actions/create-github-app-token` v3.3.0 und `VERSION_BUMPER_APPID`/`VERSION_BUMPER_SECRET`, Trusted Publishing), `package.json` auf `0.0.0` mit `publishConfig` (public, provenance); die Version steht im Tag, ein Release schreibt nichts nach `main`. In `app-templates` (PR #116, grün, `CLEAN`) und in `tooling` (Branch `feat/npm-package`, noch nicht gepusht, weil dessen CI `app-templates` 0.1.0 braucht) umgesetzt. Kette: `default.json` von `tooling` bekommt eine Regel, die Runtime-Abhängigkeiten auf `@lernapps/*` als `fix(deps)` in einer eigenen Gruppe führt, damit `tooling` und `practice` nach dem Release der Vorstufe selbst releasen; Entwicklungsabhängigkeiten (Vorlagen, Apps) bleiben `chore(deps)`, sonst gäbe es eine Endlosschleife `app-templates` ↔ `tooling`.
- [x] Erster Release-Lauf von `app-templates` (nach Merge von #116): `semantic-release` kam bis zum Push des Tags, scheiterte dort am Git-Hook `pre-push`, den `npm ci` installiert hatte. Lehre: im Release-Job `git config --local core.hooksPath /dev/null` setzen. Fix als PR lernapps/app-templates#117 (und im Branch von `tooling`). Kein Tag wurde angelegt, der nächste Merge holt die `feat`-Commits nach und ergibt `0.1.0`.
- [x] Release von `app-templates` (Merge von #117, Nutzer erlaubte mir Merges in `app-templates`, bis das Setup läuft): Lauf 41292893240 erfolgreich. `semantic-release` setzte Tag `v0.1.0` und das GitHub-Release, veröffentlichte `@lernapps/app-templates@0.1.0` über Trusted Publishing und signierte die Provenance (Sigstore-Log 3625392951). Beide Annahmen (OIDC mit dem npm-Plugin, App-Token als Bypass für den Tag) bestätigt. Auf npm erscheint die Version mit Verzögerung („may take a few minutes“). Hinweis: Auf npm existiert auch `0.0.1`, mein Platzhalter. Kleinigkeit: `successComment: false` meldet eine Deprecation von `@semantic-release/github`.
- [~] Stand `tooling` (2026-11-01, später): Branch `feat/npm-package` ist zu einem Commit zusammengefasst (5f95255, auf `origin/main` rebased), enthält zusätzlich die E2E-Tests für den Weg über `npx --package=<tgz>` (Quiz-, Explainer-, Interactive-Test bestehen bis auf einen), `evals/score-transcript.ts` (akzeptiert `npx lernapps create`), arc42 und README. `package-lock.json` neu erzeugt mit `@lernapps/app-templates@0.1.0` aus der Registry. **Nicht gepusht:** Der Pre-push-Hook (`lernapps check`, jeder Test) scheitert hier an Tests, die auch auf `main` scheitern (macOS-Umgebung: `site-pre-push`, die zehn „a consumer resolves …“, „the first commit after an earlier one“ im Interactive-Test). CI auf Linux ist das eigentliche Tor.
- [~] Stand `practice` (Worktree `../practice-npm`, Branch `feat/npm-package`, ein Commit df237d7): Paket (`bin/lernapps-practice.mjs`, `dist/skills`, `release.yml`, `.releaserc.json`), Plan-Template, `llms.txt`, Build-Action und `npm run try` auf Registry und Paketvorlage umgestellt, Docs (de/en) und arc42 (`dec-pin-from-tooling-version`) angepasst; 232 Tests grün, arc42 ohne Befund. Nicht gepusht: CI braucht `@lernapps/tooling@0.1.0`. `.vibe/development-plan.md` liegt nur im Hauptordner (ungetrackt) und muss vor dem PR in den Worktree kopiert werden.
- [x] macOS-Fixes in `tooling` (PR #233, vom Nutzer gemergt): `TMPDIR` auf den echten Pfad (die Ursache von elf Tests: `/var` ist ein Link auf `/private/var`, Node löst auf den echten Pfad auf), Start-Check von `changes/site-pre-push.ts` mit echten Pfaden (mit Test), `scripts/build.sh` ohne GNU-`sed` (`scripts/html-edit.ts`, mit Test), `arc42 diff`-Ausgabe aus einer Datei statt aus einer Pipe (die Pipe schneidet auf macOS bei 64 KiB ab). Issue dazu im arc42-Projekt: docToolchain/arc42-language#139. Danach lief der Pre-push-Hook von `tooling` lokal durch.
- [~] 2026-11-01 (später): `feat/npm-package` in `tooling` (Worktree `../tooling-feat`) liegt auf dem neuen `main`; Push läuft (Hook). Vorbereitet, unveröffentlicht: `lernapps.github.io` Branch `docs/build-with-npm-init` (`src/llms.txt`: Schnellweg mit `npx --yes @lernapps/tooling init`), `apps` Branch `feat/build-with-npm-init` (`site.js` `init` statt `create`, Seite `/build/`, Prompt de/en, `llms.njk`, E2E-Test: `init` im leeren Ordner, Plan bestätigen, `lernapps skills --archetype`, `create`, `check`). `docs` braucht keine Änderung: sein `npx skills add lernapps/docs` gilt dem Skill `pdt` für Maintainer, nicht dem Weg des Creators. Offen in `apps`: die Upgrade-Skripte lesen weiter Git-Pins älterer Apps.
- [ ] Offen nach dem Release von `tooling`: `apps` (`src/_data/site.js`: `create` und `skills`, `build.njk`, `de.js`/`en.js`, README; `test/entry-point.e2e.test.mjs` prüft heute `npx … create` von der gebauten Seite gegen GitHub; die Upgrade-Skripte `scripts/update-replay.mjs`, `upgrade-*.mjs` lesen `github:lernapps/tooling#<sha>`-Pins und müssen neben Versionen weiter Git-Pins älterer Apps verstehen), `docs` (`site/llms.txt`, arc42), `lernapps.github.io` (`src/llms.txt`: Plan-Template-Link und Skill-Installation). Erst nach dem Release, weil der E2E-Test das veröffentlichte Paket braucht.
- [x] (erledigt, siehe oben) PR lernapps/app-templates#116 mergen (der Klassifikator lässt mich nicht ohne Review mergen). Danach läuft `release.yml`, `semantic-release` setzt `v0.1.0` und veröffentlicht; ich prüfe den Lauf. Erste Läufe sind der Test für zwei Annahmen: Trusted Publishing mit dem npm-Plugin von semantic-release (OIDC) und der App-Token als Bypass für den Tag.
- [ ] Stufe 5, Teil 2: In jedem der drei Repos `.github/workflows/release.yml` (Name muss `release.yml` heißen, sonst greift der Trusted Publisher nicht): Tag `v*`, `permissions: id-token: write, contents: read`, `npm ci`, Tests, `npm publish --provenance`; Felder `repository` stimmen schon. `practice/package.json` braucht dafür Name `@lernapps/practice` und kein `private`.
- [ ] Ende-zu-Ende: Eval-Lauf (`tooling/evals`) mit den neuen Paketen, ein Creator-Durchlauf je Weg (`tooling`, `practice`).

### Completed
*None yet*

## Commit
### Tasks
- [x] Pakete auf Versionen umstellen: Vorlagen in `app-templates` (`@lernapps/tooling` als `^0.1.2` statt Git-Pin, PR #121), `apps` (Upgrade-Workflow und Replay verstehen Versions-Pins, PR #163). Der Pin der Site selbst (`package.json`, `tooling-ref`, `TOOLING_REF`) bleibt ein Commit: ein wiederverwendbarer Workflow lässt sich nur über eine Git-Referenz benennen.
- [x] `sed` portabel machen: `tooling` (#233, `scripts/html-edit.ts`), `practice` (#42), `docs` (PR #87, wartet auf den Merge des Nutzers).
- [x] Mit Agenten testen (Runde 1 und 2, je Tooling-Weg und practice-Weg, Sonnet, nur veröffentlichte Anleitung, `/tmp`, ich als Creator): beide Wege kommen bis zur GitHub-Grenze, alle vier Apps bestehen `lernapps check`, die ZIP-Datei des practice-Agenten bestand den Eingangstest und den Bau von `practice` (19 Seiten, ohne Befund).
- [x] Runde 3 mit `tooling` 0.1.3 und `practice` 0.1.4: beide Agenten kamen bis zur GitHub-Grenze, beide Apps bestehen `lernapps check`, die Skizze in `.vibe/sketches/` blockierte `create` nicht mehr, das ZIP bestand Eingangstest und Bau von `practice` (19 Seiten, ohne Befund).
- [x] Aufräumen: Worktrees `practice-npm` und `tooling-feat` entfernt, Temp-Ordner der Runden 1 und 2 gelöscht (Runde 3 bleibt unter `/tmp/lernapps-exp3-*` zur Ansicht).

### Completed
*None yet*

## Retrospective
**Ergebnis.** Alles, was die Assistenten der Creator brauchen, kommt aus der npm-Registry: `@lernapps/app-templates` 0.1.0, `@lernapps/tooling` (0.1.x) und `@lernapps/practice` (0.1.x), jeweils mit Provenance (Trusted Publishing, `semantic-release` nach Merge auf `main`, Tag mit dem Token der GitHub-App). Die Kette `app-templates → tooling → practice` läuft von selbst (Renovate `fix(deps)`, ohne Schleife; ein Test pro Repo hält den Graphen, `test/release-chain.test.ts`). Der Platzhalter `lernapps` (0.0.1) hält den ungescopten Namen.

**Was die Agenten-Läufe gezeigt haben.** Runde 1: Skills und Plan-Template stimmten, aber der Pfad `npx --yes lernapps` (Name frei), README von GitHub, kein Repo nach `init`, Screenshots-Ordner ließ den Check scheitern. Behoben in `tooling` #237 und `practice` #39. Runde 2: die gesamte Information kam aus npm (nur `llms.txt`, Katalog, Eintrags-Schema, Wikipedia und Lehrplan aus dem Netz); neu: Skizzen in `.vibe/` blockierten `create`, YAML-Fallen, `matching`-Paare. Behoben in `tooling` #238. Offen bei `app-templates`: Formel in Auswahlantworten (Issue #120).

**Fehler auf meinem Weg, damit sie nicht wiederkehren.** Ich habe „arc42 sauber“ gemeldet, ohne die Zählzeile zu lesen (drei Hinweise). Ich habe Backticks in einen Template-String geschrieben (Build brach). Ich habe die Aussage eines Agenten („keine Logikzeichen in der Formelsprache“) erst nach Prüfung verworfen: `temml` kennt sie. Der Berechtigungsprüfer hat zwei Mal einen Merge ohne Review abgelehnt (`app-templates` #116, `docs` #87); ich habe nicht umgangen, sondern den Nutzer gefragt.

**Runde 3.** Wieder kam alles aus npm. Neue Funde, noch nicht behoben: (1) `lernapps.net/apps/llms.txt` enthält keinen Katalog, der practice-Agent musste die HTML-Startseite lesen; (2) `computer-science.md` der Übungsmuster kennt keine Logik, die Aufgaben mit `generated` für UND/ODER sind umständlich; (3) `create` nennt die App nach dem Ordner, nicht nach dem Kurznamen aus `init`; (4) `lernapps screenshots` rendert 390 px, die Anleitung sagt 360 px; (5) breite Tabellen laufen auf dem Handy horizontal (app-templates); (6) die Selbsteinschätzung steht in Code, der Skill sagt Commit; (7) Agenten haken Kästchen pauschal ab.

**Danach.** Behoben und veröffentlicht: Name aus `init` bleibt App-Name, Abhak-Regel in `AGENTS.md`, 360 px (PR #200), `llms.txt` ohne GitHub-Verweise und mit dem Stopp für Umgebungen ohne Shell oder npm (zum Beispiel chatgpt.com im Browser). Stand: `tooling` 0.2.1, `practice` 0.1.6, `app-templates` 0.1.0. Issues: `apps`#165 (Katalog als statische Datei), `app-templates`#120, #122, #123, `tooling`#241.

**Offene Punkte.** `app-templates` #120 (Formel); `arc42-language` #139 (der arc42-Befehl `diff` schneidet große Ausgabe auf macOS-Pipes ab); die Aufgaben der Agenten sind nicht erzwungen (sie haken Kästchen ab, die sie nicht erfüllt haben).



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
