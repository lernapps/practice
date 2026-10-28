# Evaluation der Anleitung

Ein manueller Ablauf, bis es automatische Evals gibt. Diese Seite erklärt einem Agenten, zum Beispiel dem KI-Assistenten von jemandem, der das Repo pflegt, wie er nach einer Änderung an `llms.txt`, Plan-Vorlage oder Skills eine neue Sitzung startet, darin den Creator spielt und das Ergebnis bewertet.
## Woraus die Anleitung besteht {#source}

| Teil | Inhalt |
| --- | --- |
| [llms.txt](llms.txt) | Der Einstieg: Ordner anlegen, die Plan-Vorlage herunterladen, ihr folgen. |
| `guidance/plan-template.md` | Die Plan-Vorlage mit den Phasen des Tooling: Explore, Plan, Code, Commit. Sie installiert und nennt je Phase die Skills und sagt, an welchen Checkpoints der Assistent auf den Creator wartet (Vorschlag, Seiten, Einreichen, Adresse). |
| `lernapps-practice-explore` | Explore: eine Frage nach dem, was nur der Creator weiß; Katalog, Hinweise; der Umfang aus dem Material. |
| `lernapps-practice-plan` | Plan: ein kurzer Vorschlag mit Schwerpunkt, Seiten, die erst erklären und dann üben, reicheren Formen und markierten Vermutungen. |
| `lernapps-practice-photos` | Explore und Code: Fotos lesen, Abbildungen inhaltsgleich nachbauen. |
| `lernapps-practice-submit` | Commit: alle Seiten zeigen und die Erklärungen durchgehen, die ZIP-Datei von `src/`, das Formular, Antworten und Korrekturen. |

In Plan und Code nutzt der Assistent die Inhalts-Skills des Tooling (`lernapps-explainer`, `lernapps-explainer-design`, `lernapps-content-questions`, `lernapps-exercise-patterns`, `lernapps-content-research`, `lernapps-cli`). Ein Test prüft, dass die Plan-Vorlage genau diese Skills installiert, jeden in der Phase, die ihn zuerst lädt, und dass die Adressen der `llms.txt` stimmen.

## Eine Sitzung starten {#method}

1. **Frische Sitzung.** Starte einen Assistenten mit Shell (Node 22.18 oder neuer, git, Netz), ohne Vorwissen über dieses Repo und ohne Projektdateien. Gib ihm nur den Satz von der [Startseite](index.md#assistant).
2. **Befehle freigeben.** Die Plan-Vorlage lässt `npx skills add`, `create` und `npm` laufen. Viele Umgebungen fragen dafür nach; eine Sitzung im Auto-Modus ohne Menschen blockiert `npx skills add`. Erlaube die Befehle vorab, oder starte den Assistenten als Unteragenten dort, wo sie laufen dürfen.
3. **Den Creator spielen.** Antworte wie ein Elternteil: knapp, ohne Hilfe, die die Anleitung nicht gibt. Gib echte Fotos von Schulmaterial, außerhalb des Ordners der App. Eine Beschreibung der Fotos prüft nur das Schreiben, nicht das Lesen der Bilder.

## Beobachten {#observe}

- Wie oft fragt der Assistent, und wartet er nur an den Checkpoints (Vorschlag, Seiten, Einreichen, Adresse)?
- Liegen im Ordner genau die Skills der Tabelle oben und `app-content`, jeder ab seiner Phase?
- Ist der Vorschlag kurz, sind die Vermutungen markiert, bleibt er beim Umfang des Materials?
- Zeigt der Assistent vor dem Einreichen jede Seite?

## Einreichen {#submit}

- **Lokal:** Speichere das ZIP und baue es so, wie GitHub es täte:

  ```text
  npm ci
  npm run try -- ergebnis.zip
  ```

  Der Befehl prüft das ZIP mit den Regeln der Einreichung, baut es mit der Vorlage in dem Stand, den das Tooling auf `main` festlegt (`appTemplates.commit`; mit `--commit <sha>` ein anderer) und prüft das Bundle mit `lernapps check`. Er schreibt die Meldungen so, wie der Bot sie in das Issue kommentiert. Das gebaute Bundle liegt in `_out/site`.
- **Auf GitHub, ohne Browser:** Lege ein Test-Issue im Format des Formulars an und starte den Workflow „Submission“ mit `issue` und `zip_url` ([Betrieb](operations.md#repeat)). Gib den Kommentar des Bots unverändert dem Assistenten.

## Bewerten {#evaluate}

- Öffne jede Seite der Vorschau im Browser: Erklärt sie, bevor sie übt? Stimmen Abbildungen und Buchstaben mit dem Material? Steht irgendwo ein nicht ersetzter Platzhalter? Meldet die Konsole Fehler?
- Zähle die Läufe bis zur Adresse und die Meldungen je Lauf.
- Ordne jeden Befund zu: Anleitung (Plan-Vorlage, Skills von practice) änderst Du hier; Inhalts-Skills und Prüfungen gehören in ein Issue an lernapps/tooling, Fehler der Laufzeit in ein Issue an lernapps/app-templates, je mit einem Testbeispiel.
- Höchstens drei Durchläufe je Änderung; zwischen zwei Durchläufen verbessern.

## Die Gefahr {#danger}

- **Beschreibung statt Fotos.** Ein Test mit einer Beschreibung der Fotos sagt nichts darüber, ob der Assistent Fotos richtig liest: Reihenfolge, Ränder, Handschrift, Kästen. Nenne in der Tabelle unten, was der Durchlauf nicht geprüft hat.
- **Material nie ins Repo.** Fotos, Abschriften, Beschreibungen des Materials und Texte daraus gehören weder in einen Commit noch in ein Issue oder einen Pull Request. Das Material ist urheberrechtlich geschützt, und die Handschrift eines Kindes ist ein persönliches Datum. Auch die ZIP-Dateien eines Testlaufs bleiben außerhalb des Repos (der Ordner `_intake/` und `_out/` ist ignoriert).
- **Nicht geprüfte Fakten.** Der Test zeigt, dass das ZIP baut, nicht dass die Fakten stimmen. Der Assistent muss melden, was die Eltern prüfen sollten.

## Ergebnisse {#results}

| Durchlauf | Wer | Eingabe | Bau | `lernapps check` | Einschränkung |
| --- | --- | --- | --- | --- | --- |
| 1 | Agent mit Hintergrundwissen über das Repo | Fotos | 3 Läufe: 12 Meldungen, 2 Meldungen, ohne Meldung | ohne Befund (8 Regeln) | Das Hintergrundwissen half; die Anleitung war nicht allein. Aus den Meldungen entstanden die Stolpersteine. |
| 2 | Frische Sitzung, nur die Anleitung | Beschreibung der Fotos | 1 Lauf, ohne Meldung | ohne Befund | Das Lesen der Bilder war nicht Teil des Durchlaufs. |

| 3 bis 5 | Frische Sitzung mit Shell als Unteragent, nur die Anleitung | Fotos | je 1 Lauf, ohne Meldung | ohne Befund | Eingereicht über `zip_url` statt des Formulars. Die Befunde betrafen die Anleitung und flossen in die Skills. |

Die Durchläufe 1 und 2 galten der früheren Anleitung für einen Chat ohne Shell. Offen: ein Lauf mit dem Formular im Browser statt `zip_url`.
