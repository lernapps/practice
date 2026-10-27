# Eine Lern-App nach Maß

Nächste Woche schreibt Dein Kind eine Arbeit, und Ihr wollt genau den Stoff üben, der drankommt. Oder Du übernimmst eine Klasse in einer Vertretungsstunde und brauchst Übungen zu dem, was sie gerade durchnimmt. Für solche Anlässe gibt es selten eine fertige App, die genau passt.

Hier entsteht sie. Mit Deinem KI-Assistenten und unserer Anleitung machst Du aus dem Material, das Du ohnehin hast, mit wenig Aufwand eine Lern-App nach Maß. Damit kannst Du zum Beispiel

- Dein Kind gezielt auf eine Arbeit vorbereiten,
- einer Klasse Übungen für eine Vertretungsstunde geben,
- als Vertretung herausfinden, wo eine Klasse steht,
- verpassten Stoff nachholen.

Die App ist kostenlos und läuft im Browser. Wer damit übt, braucht weder ein Konto noch eine Installation.

## So läuft es {#schritte}

<ol class="flow">
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Dein Assistent</span>
    <h3>Vielleicht gibt es sie schon</h3>
    <p>Vielleicht hat schon jemand eine App gebaut, die zu Deinem Anlass passt. Dein Assistent sucht im Katalog danach. Gibt es eine, nutzt Ihr sie einfach: kostenlos und ohne Anmeldung, wie jede App auf lernapps.net.</p>
  </li>
  <li class="flow-step" data-who="assistant">
    <span class="flow-who">Dein Assistent</span>
    <h3>Aus Deinem Material wird Deine App</h3>
    <p>Du gibst ihm Fotos von Buchseiten oder Arbeitsblättern. Daraus stellt er Erklärungen, Übungen und eine Selbsteinschätzung zusammen, genau für Euren Stoff. Was drankommt, legt Ihr gemeinsam fest.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">Du</span>
    <h3>Ein Formular genügt</h3>
    <p>Den Inhalt schickst Du uns mit einem kurzen Formular. Dabei entsteht ein Issue: eine öffentliche Meldung in unserem Projekt auf GitHub, über die wir Dir antworten.</p>
  </li>
  <li class="flow-step" data-who="platform">
    <span class="flow-who">Wir</span>
    <h3>In wenigen Minuten bereit</h3>
    <p>Wir prüfen den Inhalt und bauen daraus die App. Nach wenigen Minuten steht ihre Adresse im Issue. Passt noch etwas nicht, steht dort, was fehlt, und Dein Assistent bessert es aus.</p>
  </li>
  <li class="flow-step" data-who="you">
    <span class="flow-who">Du und die Lernenden</span>
    <h3>Sofort loslegen</h3>
    <p>Ein Link genügt: Dein Kind oder die Klasse übt auf jedem Gerät mit Browser, ohne Konto und ohne Installation.</p>
  </li>
  <li class="flow-step" data-who="both">
    <span class="flow-who">Du und wir</span>
    <h3>Gutes bleibt für alle</h3>
    <p>Hat die App geholfen, hilft sie wahrscheinlich auch anderen, die vor demselben Stoff stehen. Mit einem 👍 auf Deinem Issue sagst Du es uns, und wir prüfen, ob sie in den Katalog passt. So kommt nach und nach immer mehr Wissen zusammen, das wirklich gebraucht wird.</p>
  </li>
</ol>

Die App speichert nichts über die Lernenden. Wie weit sie sind, zeigt ihnen die Selbsteinschätzung, und das Ergebnis behalten sie für sich. Nach zwei Wochen wird die App gelöscht, außer sie hat geholfen; mehr dazu unter [Lebensdauer](lebensdauer.md). Jeden Handgriff beim Einreichen erklärt [Einreichen: Schritt für Schritt](einreichen.md). Wie das Ganze in die Plattform passt, zeigt die Journey [A tailor-made app for an acute occasion](https://lernapps.net/docs/#x-tailor-made-app-h) im Plattformdesign (auf Englisch).

## Mit dem Assistenten starten {#assistent}

Kopiere diesen Satz in das Gespräch mit Deinem KI-Assistenten und beschreibe Deinen Anlass:

```text
Lies https://lernapps.net/practice/llms.txt und hilf mir, eine Lern-App für <Anlass> zu machen.
```

Zum Beispiel: „für die Mathearbeit meiner Tochter nächste Woche" oder „für eine Vertretungsstunde in Englisch, Klasse 7". Die Anleitung für den Assistenten steht in [llms.txt](llms.txt).

## Gut zu wissen {#wissen}

- **KI-Assistent mit Kommandozeile:** Dein Assistent baut die App selbst und prüft sie, bevor Du einreichst. So kommt sie meist beim ersten Mal durch. Dafür braucht er eine Kommandozeile, zum Beispiel Claude Code oder Codex; viele Web-Assistenten haben dafür inzwischen eine eigene Umgebung.
- **GitHub-Konto:** Zum Einreichen brauchst Du ein kostenloses GitHub-Konto, für das eine E-Mail-Adresse genügt. Kinder unter 13 Jahren dürfen kein eigenes Konto haben; dann reicht ein Erwachsener ein. Was GitHub ist und wie Du ein Konto anlegst, steht unter [GitHub, erklärt](https://lernapps.net/tooling/github/). Wer mit der App übt, braucht kein Konto.
- **Datenschutz:** Das Formular, die ZIP-Datei und die App sind öffentlich. Deshalb gehören keine Namen, keine Schule und keine Fotos in den Inhalt. Mehr unter [Datenschutz und Urheberrecht](datenschutz.md).
- **Zwei Wochen:** So lange bleibt die App erreichbar. Wie sie länger bleibt, steht unter [Lebensdauer](lebensdauer.md).

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
- **Anleitung für Assistenten**: Die [llms.txt](llms.txt) führt zur Plan-Vorlage `guidance/plan-template.md`; sie installiert die drei Skills in `skills/` und die Inhalts-Skills des Tooling.
- [Architektur](architecture/): wie das Repo gebaut ist (arc42). Diese Seite gibt es nur auf Englisch.
