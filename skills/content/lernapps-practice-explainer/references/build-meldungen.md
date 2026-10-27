# Meldungen des Baus und ihre Lösung

Der Bau meldet alle Fehler eines Laufs auf einmal, mit Datei, Zeile und Pfad. Eine Ausnahme: Von den YAML-Fehlern
meldet er nur den ersten je Lauf. Behebe zuerst die Fehler, die keine Folgefehler sind, dann baue neu.

## Gemessen in Testläufen

| Meldung (gekürzt) | Ursache | Lösung |
|---|---|---|
| `…pairs[2]: <Text> is not allowed here` | Komma im unquotierten Flussformat `{ left: …, right: a, b }` | Wert in Anführungszeichen setzen |
| `…rows[0][0]: must be a text` | Zahl in einer Tabellenzelle (`1`) | In Anführungszeichen setzen: `"1"` |
| `…header[0]: must not be empty` | leere Kopfzelle `""` | Ein Wort einsetzen |
| `not valid YAML: Nested mappings are not allowed in compact mappings` | Doppelpunkt im Text (`description: Das Haus: Bedeutung`) | Text in Anführungszeichen |
| `the link /<kapitel>/<seite>/ leads to no page of the app` | Folgefehler: die Zielseite wurde wegen eines anderen Fehlers nicht geladen, oder die Adresse stimmt nicht | Erst die anderen Fehler beheben, dann die Adresse `/<kapitel>/<seite>/` prüfen |

## Aus dem Schema abgeleitet, nicht gemessen

Diese Fälle meldet der Bau nach dem Schema; der genaue Wortlaut der Meldung kann abweichen.

| Fall | Ursache | Lösung |
|---|---|---|
| Link relativ (`../seite`) | interne Links stehen mit Schrägstrich am Anfang | `/<kapitel>/<seite>/` |
| Anker `#<id>` ohne Ziel | die Zielseite hat keinen `section` mit dieser `id` | Abschnitt mit genau dieser `id` anlegen |
| Kasten in Kasten | `note` oder `example` enthält `note`, `example` oder `section` | `note` neben `example` setzen |
| `answer` oder `message` fehlt bei `mistakes` | Eintrag heißt nicht so (`number` statt `answer`) | `{ answer: 10, message: "…" }` |
| Frage ohne `explanation` oder `links` | Pflichtfelder fehlen | ergänzen; `links` mit `title` und https-`url` |
| Option ohne `info` | Pflichtfeld je Option | Ein bis drei Sätze, warum richtig oder falsch |
| Seite ohne Frage | jede Seite braucht eine Aufgabe | eine Frage im Abschnitt „Übung“ ergänzen |

Wie der Bot die Meldungen zeigt: ein Kommentar im Issue mit höchstens 60 Zeilen in einem Textblock. Die Eltern geben ihn
dem Assistenten, der das ZIP korrigiert.
