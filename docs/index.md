# Eine Lern-App nach Maß

Nächste Woche ist die Arbeit, und im Katalog passt keine App. Oder eine Lehrkraft fehlt, und die Klasse braucht Übungen, die zum Stoff passen. Dann macht Dein KI-Assistent in Minuten eine kleine Lern-App nach Maß. Sie ist vorübergehend und kostenlos. Die Lernenden brauchen kein Konto.

Die Anleitung für den Assistenten (llms.txt, Skills) ist bisher für Eltern geschrieben. Sie führt Dich und Dein Kind durch die Vorbereitung auf eine Arbeit.

## So läuft es {#schritte}

<ol class="flow">
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Dein Assistent</span>
    <h3>Dein Assistent durchsucht den Katalog</h3>
    <p>Vielleicht hat schon jemand anderes etwas Passendes gebaut? Dann nutzt Du die App einfach. Kostenlos, ohne Anmeldung. Wie immer.</p>
  </li>
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Dein Assistent</span>
    <h3>Dein Assistent führt Dich</h3>
    <p>Er liest die Fotos vom Material und schreibt eigene Übungen. Du bestätigst mit Deinem Kind den Umfang.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">Du</span>
    <h3>Du reichst den Inhalt ein</h3>
    <p>Du schickst ihn mit einem Formular ab. Das legt ein Issue an, eine öffentliche Meldung in unserem Repository auf GitHub.</p>
  </li>
  <li class="flow-step" data-who="platform">
    <span class="flow-who">Die Plattform</span>
    <h3>Die Plattform prüft und baut</h3>
    <p>Sie baut die App und schreibt die Adresse in einen Kommentar. Fehlt etwas, sagt sie es, und Dein Assistent bessert nach.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">Du & Dein Kind</span>
    <h3>Du öffnest die Adresse und übst</h3>
    <p>Gib sie Deinem Kind oder der Klasse. Es braucht kein Konto und keine Installation.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">Du</span>
    <h3>Was geholfen hat, hält ein 👍</h3>
    <p>Setze es auf das erste Feld des Issues. Dann bleibt die App, und wir prüfen, ob sie in den Katalog passt.</p>
  </li>
</ol>

Die App speichert nichts über Dein Kind. Die Selbsteinschätzung zählt das Kind selbst. Nach zwei Wochen ist die App weg, außer ein 👍 hält sie ([Lebensdauer](lebensdauer.md)). Jeden Handgriff beim Einreichen erklärt [Einreichen: Schritt für Schritt](einreichen.md). Die Journey im Plattformdesign steht unter [A tailor-made app for an acute occasion](https://lernapps.net/docs/#x-tailor-made-app-h) (auf Englisch).

## Mit dem Assistenten starten {#assistent}

Kopiere diesen Satz in das Gespräch mit Deinem KI-Assistenten und ersetze `<Fach>`:

```text
Lies https://lernapps.net/practice/llms.txt und hilf mir, mein Kind auf die Arbeit in <Fach> vorzubereiten.
```

Die Anleitung für den Assistenten steht in [llms.txt](llms.txt). Er fragt Dich nach Fach, Klassenstufe und Bundesland.

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
