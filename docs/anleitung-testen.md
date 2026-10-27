# Die Anleitung testen

Für Menschen, die das Repo pflegen. Die Anleitung für Assistenten ([llms.txt](llms.txt)) ist getestet: Eine frische Assistenten-Sitzung hat nur mit ihr ein ZIP gebaut, das auf Anhieb gebaut hat. Diese Seite sagt, wie man das wiederholt, wenn man die Skills ändert.

## Woraus die Anleitung besteht {#quelle}

Die Anleitung hat eine Quelle: drei Skills im Ordner `skills/`.

| Skill | Inhalt |
| --- | --- |
| `lernapps-practice` | Der Ablauf von der Frage bis zum Einreichen, in sieben Schritten. Bei den Schritten 1, 4 und 7 wartet der Assistent auf die Eltern. |
| `lernapps-practice-photos` | Hinweise an die Eltern vor den Fotos, Fotos lesen. |
| `lernapps-practice-explainer` | Den Inhalt eines Explainers schreiben, mit `references/` für die Block-Tabelle und die Meldungen des Baus. |

`npm run llms` setzt daraus `docs/llms.txt` zusammen, in einem Stück. Ein Test prüft, dass die eingecheckte Datei mit dem Ergebnis übereinstimmt. Nach jeder Änderung an einem Skill läuft deshalb `npm run llms`, und beide Dateien kommen in denselben Commit.

## So testet man {#methode}

1. **Frische Sitzung.** Öffne einen Assistenten ohne Vorwissen über dieses Repo und ohne Projektdateien. Gib ihm nur den Satz von der [Startseite](index.md#assistent) und das Material.
2. **Echtes Material.** Nimm Fotos von echtem Schulmaterial (Arbeitsblätter, Buchseiten). Eine Beschreibung der Fotos prüft nur das Schreiben, nicht das Lesen der Bilder.
3. **Nichts nachhelfen.** Antworte wie ein Elternteil. Sage dem Assistenten nichts, was die Anleitung nicht sagt.
4. **Das Ergebnis bauen.** Speichere das ZIP und baue es lokal, so wie GitHub es täte:

   ```text
   npm ci
   npm run try -- ergebnis.zip
   ```

   Der Befehl prüft das ZIP mit den Regeln der Einreichung, baut es mit der Vorlage im festgelegten Stand (`appTemplates.commit`) und prüft das Bundle mit `lernapps check`. Er schreibt die Meldungen so, wie der Bot sie in das Issue kommentiert. Der erste Lauf lädt die Vorlage nach `_templates/` und braucht einige Minuten; spätere Läufe sind schneller. Das gebaute Bundle liegt in `_out/site`.
5. **Fehlerkreislauf.** Gib die Meldungen unverändert dem Assistenten, lass ihn das ZIP korrigieren und baue neu. Zähle die Läufe und die Meldungen je Lauf.
6. **Aus Fehlern lernen.** Jede Meldung, die der Assistent nicht allein lösen konnte, gehört als Stolperstein oder als Zeile in `references/build-meldungen.md` des Skills. Danach `npm run llms` und einen neuen Durchlauf.

## Die Gefahr {#gefahr}

- **Beschreibung statt Fotos.** Ein Test mit einer Beschreibung der Fotos sagt nichts darüber, ob der Assistent Fotos richtig liest: Reihenfolge, Ränder, Handschrift, Kästen. Nenne in der Tabelle unten, was der Durchlauf nicht geprüft hat.
- **Material nie ins Repo.** Fotos, Abschriften, Beschreibungen des Materials und Texte daraus gehören weder in einen Commit noch in ein Issue oder einen Pull Request. Das Material ist urheberrechtlich geschützt, und die Handschrift eines Kindes ist ein persönliches Datum. Auch die ZIP-Dateien eines Testlaufs bleiben außerhalb des Repos (der Ordner `_intake/` und `_out/` ist ignoriert).
- **Nicht geprüfte Fakten.** Der Test zeigt, dass das ZIP baut, nicht dass die Fakten stimmen. Der Assistent muss melden, was die Eltern prüfen sollten.

## Ergebnisse {#ergebnisse}

| Durchlauf | Wer | Eingabe | Bau | `lernapps check` | Einschränkung |
| --- | --- | --- | --- | --- | --- |
| 1 | Agent mit Hintergrundwissen über das Repo | Fotos | 3 Läufe: 12 Meldungen, 2 Meldungen, ohne Meldung | ohne Befund (8 Regeln) | Das Hintergrundwissen half; die Anleitung war nicht allein. Aus den Meldungen entstanden die Stolpersteine. |
| 2 | Frische Sitzung, nur die Anleitung | Beschreibung der Fotos | 1 Lauf, ohne Meldung | ohne Befund | Das Lesen der Bilder war nicht Teil des Durchlaufs. |

Offen: Ein Durchlauf einer frischen Sitzung mit Fotos, und ein Lauf auf GitHub mit dem Bot statt `npm run try`.
