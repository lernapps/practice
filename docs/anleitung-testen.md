# Die Anleitung testen

Für Menschen, die das Repo pflegen. Die Anleitung für Assistenten führt einen Assistenten ohne Vorwissen bis zur Adresse der App. Diese Seite sagt, wie man das prüft, wenn man die Plan-Vorlage oder die Skills ändert.

## Woraus die Anleitung besteht {#quelle}

| Teil | Inhalt |
| --- | --- |
| [llms.txt](llms.txt) | Der Einstieg: Ordner anlegen, die Plan-Vorlage herunterladen, ihr folgen. |
| `guidance/plan-template.md` | Die Plan-Vorlage mit den Phasen des Tooling: Explore, Plan, Code, Commit. Sie installiert die Skills, nennt je Phase die Skills und sagt, an welchen Checkpoints der Assistent auf den Creator wartet (Konzept, Plan, Einreichen, Adresse). |
| `lernapps-practice-explore` | Explore: Anlass, Katalog, Hinweise, Konzept mit Umfang und Gewichtung. |
| `lernapps-practice-photos` | Explore und Code: Fotos lesen, Abbildungen inhaltsgleich nachbauen. |
| `lernapps-practice-submit` | Commit: die ZIP-Datei von `src/`, das Formular, Antworten und Korrekturen. |

In Plan und Code nutzt der Assistent die Inhalts-Skills des Tooling (`lernapps-explainer`, `lernapps-explainer-design`, `lernapps-content-questions`, `lernapps-exercise-patterns`, `lernapps-content-research`, `lernapps-check`). Ein Test prüft, dass die Plan-Vorlage genau diese Skills installiert und dass die Adressen der `llms.txt` stimmen.

## So testet man {#methode}

1. **Frische Sitzung.** Öffne einen Assistenten ohne Vorwissen über dieses Repo und ohne Projektdateien. Gib ihm nur den Satz von der [Startseite](index.md#assistent) und das Material.
2. **Echtes Material.** Nimm Fotos von echtem Schulmaterial (Arbeitsblätter, Buchseiten). Eine Beschreibung der Fotos prüft nur das Schreiben, nicht das Lesen der Bilder.
3. **Nichts nachhelfen.** Antworte wie ein Elternteil. Sage dem Assistenten nichts, was die Anleitung nicht sagt.
4. **Das Ergebnis bauen.** Der Assistent baut und prüft die App schon selbst (`npm run build`, `npm run check`). Speichere das ZIP und baue es lokal, so wie GitHub es täte:

   ```text
   npm ci
   npm run try -- ergebnis.zip
   ```

   Der Befehl prüft das ZIP mit den Regeln der Einreichung, baut es mit der Vorlage in dem Stand, den das Tooling auf `main` festlegt (`appTemplates.commit`; mit `--commit <sha>` ein anderer) und prüft das Bundle mit `lernapps check`. Er schreibt die Meldungen so, wie der Bot sie in das Issue kommentiert. Der erste Lauf lädt die Vorlage nach `_templates/` und braucht einige Minuten; spätere Läufe sind schneller. Das gebaute Bundle liegt in `_out/site`.
5. **Fehlerkreislauf.** Gib die Meldungen unverändert dem Assistenten, lass ihn das ZIP korrigieren und baue neu. Zähle die Läufe und die Meldungen je Lauf.
6. **Aus Fehlern lernen.** Jede Meldung, die der Assistent nicht allein lösen konnte, gehört als Stolperstein in den Skill der Phase: in die von practice, wenn sie die Einreichung betrifft, sonst als Hinweis an das Tooling. Danach ein neuer Durchlauf.

## Die Gefahr {#gefahr}

- **Beschreibung statt Fotos.** Ein Test mit einer Beschreibung der Fotos sagt nichts darüber, ob der Assistent Fotos richtig liest: Reihenfolge, Ränder, Handschrift, Kästen. Nenne in der Tabelle unten, was der Durchlauf nicht geprüft hat.
- **Material nie ins Repo.** Fotos, Abschriften, Beschreibungen des Materials und Texte daraus gehören weder in einen Commit noch in ein Issue oder einen Pull Request. Das Material ist urheberrechtlich geschützt, und die Handschrift eines Kindes ist ein persönliches Datum. Auch die ZIP-Dateien eines Testlaufs bleiben außerhalb des Repos (der Ordner `_intake/` und `_out/` ist ignoriert).
- **Nicht geprüfte Fakten.** Der Test zeigt, dass das ZIP baut, nicht dass die Fakten stimmen. Der Assistent muss melden, was die Eltern prüfen sollten.

## Ergebnisse {#ergebnisse}

| Durchlauf | Wer | Eingabe | Bau | `lernapps check` | Einschränkung |
| --- | --- | --- | --- | --- | --- |
| 1 | Agent mit Hintergrundwissen über das Repo | Fotos | 3 Läufe: 12 Meldungen, 2 Meldungen, ohne Meldung | ohne Befund (8 Regeln) | Das Hintergrundwissen half; die Anleitung war nicht allein. Aus den Meldungen entstanden die Stolpersteine. |
| 2 | Frische Sitzung, nur die Anleitung | Beschreibung der Fotos | 1 Lauf, ohne Meldung | ohne Befund | Das Lesen der Bilder war nicht Teil des Durchlaufs. |

Beide Durchläufe galten der früheren Anleitung für einen Chat ohne Shell. Offen: ein Durchlauf einer frischen Sitzung mit Shell, Plan-Vorlage und Fotos, und ein Lauf auf GitHub mit dem Bot statt `npm run try`.
