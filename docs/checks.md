# Prüfungen

Eine Einreichung geht durch drei Stufen. Eine Stufe beginnt erst, wenn die davor ohne Fehler war.

## Stufe 1: Annahme (Job `intake`) {#acceptance}

Der Job liest nur. Er führt nichts aus, was in der ZIP-Datei steht.

1. Das Issue stammt aus dem Formular (alle fünf Überschriften sind da) und ist offen. Sonst passiert nichts.
2. Die Angaben stimmen mit den Listen überein, und die drei Erklärungen sind angekreuzt.
3. Die ZIP-Adresse hat genau die Form `https://github.com/user-attachments/files/<Zahl>/<Name>.zip`. Die Datei wird mit `curl -L` geladen (nur `https`, höchstens 5 Weiterleitungen, 10 MB, 60 Sekunden). Die Endadresse muss bei GitHub liegen.
4. Das Verzeichnis der ZIP-Datei wird geprüft (Pfade, Arten, Endungen, Größen, Anzahl), dann wird jede Datei mit hartem Größenlimit entpackt und gegen die Prüfsumme gelegt. Die [Regeln](rules.md) nennen die Grenzen. `src/main.ts` wird nie entpackt.
5. Jedes SVG-Bild wird auf seinen Inhalt geprüft: Es darf nur zeichnen ([SVG-Bilder](rules.md#svg)).

Bei einem Fehler startet kein Bau. Stattdessen schreibt der Job `publish` einen Kommentar in einfacher Sprache.

## Stufe 2: Bau (Job `build`) {#build}

Der Job hat nur Leserechte und keine Geheimnisse. Er baut so:

1. Er holt `lernapps/app-templates` in genau dem Stand (Commit), mit dem Dein Assistent die App angelegt hat: `appTemplates.commit` aus der `package.json` von `lernapps/tooling` auf `main`, gelesen beim Bauen. Ist sie nicht lesbar, bricht der Bau mit einer klaren Meldung ab.
2. Er nimmt den Ordner `explainer/` als App und ersetzt `src/` durch Deinen Inhalt. Die `main.ts` der Vorlage bleibt. Beispielkomponenten und Beispielkapitel entfallen.
3. Er installiert mit `npm ci`, führt die Tests Deiner Komponenten aus (`vp test`, nur wenn es Komponenten gibt) und baut mit `npm run build`. Die Vorlage hängt von `file:..` ab (dem Elternordner mit der Laufzeit). Darum wird erst im Wurzelordner von `app-templates` installiert (das baut die Laufzeit), dann im Ordner `explainer/`. Beide Lock-Dateien legen die Versionen fest. Danach installiert er `@lernapps/tooling` in dem Commit von `main`, aus dem er den Stand der Vorlage gelesen hat: dasselbe Tooling, mit dem Dein Assistent die App angelegt und geprüft hat.
4. Er prüft das gebaute Bundle mit `lernapps check _site` (siehe unten).
5. Er setzt in jede HTML-Seite `<meta name="robots" content="noindex">`, damit Suchmaschinen die Vorschau nicht aufnehmen.

Der Bau des Explainers prüft dabei den Inhalt und den Code jeder Komponente: kein Netz (`fetch` und Co.), kein `eval`, kein `innerHTML` und kein `v-html`, nur erlaubte Imports, Browser-Objekte erst in `onMounted`, höchstens 20 kB eigener Code, je Komponente ein Test, und für eine Übungs-Komponente der Vertrag mit 50 festen Aufgaben. Ein Verstoß steht mit Datei, Zeile und Regel im Kommentar.

Der Job führt dabei Code Deiner Komponenten aus (ihre Tests und ihre Logik beim Bauen). Er hat deshalb nur Leserechte und kein Geheimnis. Die Typprüfung der Komponenten (`vue-tsc`) läuft hier nicht; sie läuft bei Deinem Assistenten mit `npm run check`.

## Die Prüfung des Bundles {#bundle}

`lernapps check <Ordner>` prüft ein gebautes Bundle ohne Katalogeintrag. Dafür öffnet es jede Seite in einem Browser, wie ein Lernender es täte, und prüft diese acht Regeln der Plattform:

| Regel | Frage |
| --- | --- |
| `accessible` | Ist die Seite barrierefrei (WCAG 2.1 AA)? |
| `usable-at-360px` | Geht alles bei 360 px Breite ohne Querscrollen? |
| `no-tracking` | Setzt die Seite keine Cookies und sendet keine Daten? |
| `no-request-before-click` | Fragt die Seite keinen anderen Server an, bevor jemand klickt? |
| `own-data-only` | Berührt die Seite nur die eigenen Daten im Browser? |
| `links-resolve` | Führt jeder Link auf eine Seite oder Datei, die es gibt? |
| `pages-reachable` | Ist jede Seite von der Startseite aus erreichbar? |
| `explainer-readable-without-js` | Ist der Inhalt auch ohne JavaScript lesbar? |

**Jede dieser Regeln muss bestehen.** Wir lockern keine, denn sie schützen Kinder (keine Verfolgung) und den gemeinsamen Browser-Speicher der Plattform (`own-data-only`). Die Prüfung dauert etwa 10 Sekunden.

## Was bei einer Vorschau nicht gilt {#not-checked}

Diese Regeln der Plattform gelten für den Katalog, nicht für eine Vorschau auf Zeit. Wir prüfen sie hier nicht:

| Nicht geprüft | Grund |
| --- | --- |
| Katalogeintrag (`entry-from-schema`, `entry-links-resolve`, `entry-fitness-matches`) | Eine Vorschau steht nicht im Katalog. Es gibt keinen Eintrag, den man prüfen könnte. |
| `dependency-licence`, `app-content-guide` | Beide brauchen das Repo einer App. Die Abhängigkeiten stehen in der Lock-Datei der Vorlage. Eine Vorschau hat keinen eigenen Inhalts-Leitfaden. |
| Inhaltliche Prüfung (`learners-act`, `learner-text-german`, `third-party-licence`, `no-learner-data-in-texts`) | Das beurteilt ein Mensch bei der Aufnahme in den Katalog. Bis dahin gelten Deine drei Erklärungen. |
| Impressum und Datenschutz der App | Die Seiten der Vorlage verlinken sie schon auf `lernapps.net`. Eine eigene Prüfung entfällt. |
| Formatierung und Stil der Dateien | Eine Vorschau scheitert nie an der Schreibweise (Einrückung, Leerzeilen). Wir führen keine Formatprüfung aus und formatieren Deinen Inhalt nicht um. Nur die Regeln des Explainers für den Inhalt zählen. |
| Eintrag in Suchmaschinen | Die Vorschau soll nicht gefunden werden. Darum steht `noindex` auf jeder Seite. |

## Stufe 3: Veröffentlichung (Job `publish`) {#publication}

Der Job führt nur Code aus diesem Repo aus. Das Ergebnis des Baus behandelt er als Daten.

1. Er prüft die Seite noch einmal: Anzahl und Größe der Dateien, Namen, Endungen, Links, `noindex` auf jeder Seite.
2. Er schreibt sie auf den Branch `gh-pages` in den Ordner `i/<Nummer>/` und legt `i/<Nummer>/practice.json` dazu ([Lebensdauer](lifetime.md)).
3. Er wartet, bis die Adresse den neuen Stand liefert, und schreibt den Link in den Kommentar.
