# Eine Lern-App nach Maß für einen akuten Anlass

Nächste Woche ist die Arbeit, und im Katalog passt keine App. Oder eine Lehrkraft fehlt, und die Klasse braucht Übungen, die zum Stoff passen. Dann macht Dein KI-Assistent in Minuten eine kleine Lern-App nach Maß. Sie ist vorübergehend und kostenlos. Die Lernenden brauchen kein Konto.

Die Anleitung für den Assistenten (llms.txt, Skills) ist bisher für Eltern geschrieben. Sie führt Dich und Dein Kind durch die Vorbereitung auf eine Arbeit.

## Was die Plattform für Dich tut {#kurz}

- **Eine passende Lösung statt langer Suche.** Zuerst schaut Dein Assistent im Katalog nach. Passt dort eine App, ist die Sache erledigt. Nur wenn nichts passt, entsteht eine eigene.
- **Dein Assistent führt Dich.** Er fragt nach Fach, Klassenstufe und Tag der Arbeit. Aus Fotos vom Material schreibt er eigene Übungen. Du bestätigst den Umfang mit Deinem Kind.
- **Geprüft und gebaut.** Die Plattform prüft den Inhalt und baut daraus die App. Fehler meldet sie so, dass Dein Assistent sie beheben kann.
- **Dein Kind übt sofort.** Es öffnet die Adresse, ohne Konto und ohne Installation. Die App speichert nichts über Dein Kind.
- **Nach zwei Wochen ist sie weg.** Es sei denn, sie hat geholfen und jemand sagt es.

## So läuft es {#schritte}

1. **Zuerst im Katalog suchen.** *Du:* Dir fällt auf, dass keine App zum Stoff passt. *Die Plattform:* Dein Assistent sucht im [Katalog](https://lernapps.net/apps/) nach Fach, Stufe und Thema. Findet er eine passende App, bekommst Du den Link und musst nichts bauen.
2. **Dein Assistent führt Dich durch.** *Du:* Du nennst Fach, Klassenstufe, Bundesland und den Tag der Arbeit. Du gibst ihm Fotos vom Material und prüfst mit Deinem Kind die Liste der Themen. *Die Plattform:* Die Anleitung sagt Deinem Assistenten, was er fragt, was er ohne Abschreiben schreibt und wann er auf Dich wartet. Die Fotos gehen nur an Deinen Assistenten.
3. **Einreichen und prüfen lassen.** *Du:* Du reichst den Inhalt als ZIP-Datei über ein Formular ein. *Die Plattform:* GitHub prüft den Inhalt und baut die App. Fehlt etwas, schreibt sie es in einen Kommentar, und Dein Assistent korrigiert. Jeden Handgriff erklärt [Einreichen: Schritt für Schritt](einreichen.md).
4. **Die App übergeben.** *Du:* Du gibst die Adresse an Dein Kind oder die Klasse. *Die Plattform:* Sie schreibt die Adresse in einen Kommentar.
5. **Üben.** *Dein Kind:* Es macht die Selbsteinschätzung, löst die Übungen und folgt dem Trainingsplan. Die Selbsteinschätzung zählt das Kind selbst. *Die Plattform:* Sie merkt sich nichts über das Kind.
6. **Was sich bewährt.** *Du:* Hat die App geholfen, setzt Du ein 👍 auf das erste Feld des Issues. *Die Plattform:* Dann bleibt die App erhalten, und wir prüfen, ob der Inhalt in den Katalog passt. Ohne 👍 wird sie gelöscht ([Lebensdauer](lebensdauer.md)).

## Mit dem Assistenten starten {#assistent}

Kopiere diesen Satz in das Gespräch mit Deinem KI-Assistenten und ersetze `<Fach>`:

```text
Lies https://lernapps.net/practice/llms.txt und hilf mir, mein Kind auf die Arbeit in <Fach> vorzubereiten.
```

Die Anleitung für den Assistenten steht in [llms.txt](llms.txt). Er fragt Dich nach Fach, Klassenstufe, Bundesland und dem Tag der Arbeit.

## Gut zu wissen {#wissen}

- **GitHub-Konto:** Zum Einreichen brauchst Du ein GitHub-Konto. Es ist kostenlos und braucht nur eine E-Mail-Adresse. Kinder unter 13 Jahren legen es nicht selbst an, das tun die Eltern. Was GitHub ist und wie das Konto geht, steht unter [GitHub, erklärt](https://lernapps.net/tooling/github/). Das Kind selbst braucht kein Konto.
- **Datenschutz:** Das Formular, die ZIP-Datei und die App sind öffentlich. Der Inhalt enthält deshalb keine Namen, keine Schule und keine Fotos. Mehr unter [Datenschutz und Urheberrecht](datenschutz.md).
- **Zwei Wochen:** Danach wird die App gelöscht. Wie Du sie länger erhältst, steht unter [Lebensdauer](lebensdauer.md).

## Wohin als Nächstes? {#weiter}

| Ich möchte … | Seite |
| --- | --- |
| eine Vorbereitung einreichen | [Einreichen: Schritt für Schritt](einreichen.md) |
| wissen, was in der ZIP-Datei stehen darf | [Regeln für Inhalt und Angaben](regeln.md) |
| wissen, was mit den Daten geschieht und wem der Inhalt gehört | [Datenschutz und Urheberrecht](datenschutz.md) |
| wissen, wie lange eine App bleibt | [Lebensdauer](lebensdauer.md) |
| als KI-Assistent die Einreichung vorbereiten | [llms.txt](llms.txt) |

## Für Maintainer {#maintainer}

- [Betrieb](betrieb.md): wozu das Repo da ist, wie es läuft und wie man Fehler sucht.
- [Prüfungen](pruefungen.md): was bei einer Einreichung geprüft wird.
- [Die Anleitung testen](anleitung-testen.md): wie man die Anleitung für Assistenten prüft und lokal baut.
- **Skills installieren**: Die Anleitung besteht aus drei Skills in `skills/`. Ein Skill-Installer liest sie aus dem Repo: `npx --yes skills add lernapps/practice -y -s lernapps-practice` (ebenso `-s lernapps-practice-photos` und `-s lernapps-practice-explainer`). Der Einstieg für jeden Assistenten bleibt die [llms.txt](llms.txt); sie enthält alle drei Skills in einem Dokument und entsteht mit `npm run llms`.
- [Architektur](architecture/): wie das Repo gebaut ist (arc42). Diese Seite gibt es nur auf Englisch.
