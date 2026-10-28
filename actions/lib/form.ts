// Reads the text of an issue that came from the form `.github/ISSUE_TEMPLATE/einreichen.yml`: GitHub writes each
// field as a level-3 heading with the label, then the value. Everything here is strict and treats the text as data.
import { FORM_LABELS, GRADES, MAX_SUBJECT_LENGTH, STATES } from "./limits.ts";
import { show, type Problem } from "./zip.ts";

export type Sections = Record<string, string>;

/** The sections of the issue text by label. A label that appears twice keeps the first. */
export function sections(body: string): Sections {
  const result: Sections = {};
  let label: string | undefined;
  let lines: string[] = [];
  const close = () => {
    if (label !== undefined && !(label in result)) result[label] = lines.join("\n").trim();
  };
  for (const line of body.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = /^### (.+?)\s*$/.exec(line);
    if (heading) {
      close();
      label = heading[1];
      lines = [];
    } else {
      lines.push(line);
    }
  }
  close();
  return result;
}

/** Whether the issue came from the form: every heading of the form is there. */
export function isSubmission(body: string): boolean {
  const found = sections(body);
  return FORM_LABELS.every((label) => Object.hasOwn(found, label));
}

/** The subject: one short line, no control or format characters (also none that reverse the text direction). */
export function cleanSubject(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Zl}\p{Zp}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

const NO_RESPONSE = /^_no response_$/i;

export interface Meta {
  fach: string;
  klassenstufe: string;
  bundesland: string;
}

/** The three fields, or the problems. */
export function readMeta(found: Sections): { meta?: Meta; problems: Problem[] } {
  const problems: Problem[] = [];
  const subject = cleanSubject(found["Fach"] ?? "");
  if (subject === "" || NO_RESPONSE.test(subject)) {
    problems.push({ code: "fach-missing", text: "Das Feld »Fach« ist leer. Schreibe das Fach hinein, zum Beispiel »Mathematik«." });
  } else if (Array.from(subject).length > MAX_SUBJECT_LENGTH) {
    problems.push({ code: "fach-long", text: `Das Feld »Fach« ist zu lang. Schreibe höchstens ${MAX_SUBJECT_LENGTH} Zeichen.` });
  }
  const grade = (found["Klassenstufe"] ?? "").trim();
  if (!GRADES.includes(grade)) {
    problems.push({
      code: "klassenstufe",
      text: `Die Klassenstufe »${show(grade)}« gibt es nicht in der Liste. Wähle eine Zahl von 1 bis 13.`,
    });
  }
  const state = (found["Bundesland"] ?? "").trim();
  if (!STATES.includes(state)) {
    problems.push({ code: "bundesland", text: `Das Bundesland »${show(state)}« gibt es nicht in der Liste. Wähle eines der 16 Bundesländer.` });
  }
  if (problems.length > 0) return { problems };
  return { meta: { fach: subject, klassenstufe: grade, bundesland: state }, problems };
}

/** The three declarations must all be ticked: lines `- [x] …`. */
export function readDeclarations(found: Sections): Problem[] {
  const lines = (found["Erklärungen"] ?? "").split("\n").filter((line) => /^\s*- \[[ xX]\]/.test(line));
  const ticked = lines.filter((line) => /^\s*- \[[xX]\]/.test(line)).length;
  if (lines.length < 3 || ticked < lines.length) {
    return [
      {
        code: "erklaerungen",
        text: "Die drei Erklärungen sind nicht alle angekreuzt. Setze bei jeder einen Haken. Ohne sie veröffentlichen wir nichts.",
      },
    ];
  }
  return [];
}

/** The only address we load from: GitHub's attachment store, one ZIP file. */
export const ZIP_URL = /https:\/\/github\.com\/user-attachments\/files\/(\d{1,20})\/([A-Za-z0-9._%+~-]{1,200}\.zip)(?![A-Za-z0-9._%+~-])/g;

export const NO_ZIP_HELP =
  "Kein ZIP gefunden. So hängst Du es an: Ziehe die ZIP-Datei in das Kommentarfeld unten in diesem Issue und warte, " +
  "bis dort ein Link erscheint. Er sieht so aus: `[name.zip](https://github.com/user-attachments/files/…/name.zip)`. " +
  "Klicke dann auf »Comment«. Danach prüft GitHub die Datei von selbst.";

/** The address of the ZIP file in the field, or the problems. */
export function readZipUrl(found: Sections): { url?: string; problems: Problem[] } {
  const field = found["ZIP-Datei"] ?? "";
  const urls = zipUrlsIn(field);
  if (urls.length === 0) {
    const other = /https?:\/\/\S+/.test(field);
    return {
      problems: [
        {
          code: "zip-missing",
          text: other
            ? `${NO_ZIP_HELP}\n\nIm Feld steht ein anderer Link. Wir laden nur ZIP-Dateien, die Du auf GitHub selbst anhängst.`
            : NO_ZIP_HELP,
        },
      ],
    };
  }
  if (urls.length > 1) {
    return {
      problems: [{ code: "zip-several", text: "Im Feld »ZIP-Datei« stehen mehrere ZIP-Dateien. Lass nur eine stehen." }],
    };
  }
  return { url: urls[0], problems: [] };
}

/** The ZIP addresses in a text, each once. */
export function zipUrlsIn(text: string): string[] {
  return [...new Set([...text.matchAll(ZIP_URL)].map((m) => m[0]))];
}

/** The number of an attachment address: GitHub counts up, so the larger number is the later upload. */
export function attachmentNumber(url: string): number {
  return Number(/\/files\/(\d{1,20})\//.exec(url)?.[1] ?? 0);
}

/**
 * The ZIP file that counts: the latest upload of the creator, in the field of the form or in a comment of their own
 * (`ownerComments`, the texts of the comments of the issue's author). A newer one in a comment replaces the field, so
 * a new version needs no edit of the form.
 */
export function chooseZipUrl(found: Sections, ownerComments: readonly string[] = []): { url?: string; problems: Problem[] } {
  const field = readZipUrl(found);
  const latest = ownerComments
    .flatMap(zipUrlsIn)
    .reduce<string | undefined>((best, url) => (best === undefined || attachmentNumber(url) > attachmentNumber(best) ? url : best), undefined);
  if (latest === undefined) return field;
  if (field.url !== undefined && attachmentNumber(field.url) >= attachmentNumber(latest)) return field;
  return { url: latest, problems: [] };
}
