// The few calls of the GitHub REST API the actions need, and the texts of the comments. Only Node's own modules.
// A comment is written only by the job publish and by expire; both run code of this repo alone.

export const COMMENT_MARKER = "<!-- lernapps-practice -->";
export const EXPIRED_MARKER = "<!-- lernapps-practice-expired -->";

export interface Api {
  request(method: string, path: string, body?: unknown): Promise<{ status: number; body: unknown }>;
}

export function apiFromEnv(env: NodeJS.ProcessEnv = process.env): Api & { repo: string } {
  const base = (env["GITHUB_API_URL"] || "https://api.github.com").replace(/\/+$/, "");
  const token = env["GITHUB_TOKEN"] ?? "";
  const repo = env["GITHUB_REPOSITORY"] ?? "";
  if (token === "" || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("GITHUB_TOKEN or GITHUB_REPOSITORY is not set");
  return {
    repo,
    async request(method, path, body) {
      const response = await fetch(`${base}${path}`, {
        method,
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${token}`,
          "x-github-api-version": "2022-11-28",
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(30_000),
      });
      const text = await response.text();
      let parsed: unknown;
      try {
        parsed = text === "" ? undefined : JSON.parse(text);
      } catch {
        parsed = undefined;
      }
      return { status: response.status, body: parsed };
    },
  };
}

/** All pages of a list endpoint. */
export async function paginate<T>(api: Api, path: string): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const joined = path.includes("?") ? "&" : "?";
    const response = await api.request("GET", `${path}${joined}per_page=100&page=${page}`);
    if (response.status !== 200 || !Array.isArray(response.body)) {
      throw new Error(`GET ${path} answered ${response.status}`);
    }
    all.push(...(response.body as T[]));
    if (response.body.length < 100) break;
  }
  return all;
}

interface CommentRow {
  id: number;
  body?: string;
  user?: { type?: string };
}

const FINGERPRINT = /<!-- lernapps-practice-input: ([0-9a-f]{64}) -->/;

/** The fingerprint of the input that a comment of the bot records (hidden), if any. */
export const fingerprintIn = (body: string): string | undefined => FINGERPRINT.exec(body)?.[1];

/** The hidden line that records the input a comment was written for. */
export const fingerprintLine = (fingerprint: string): string => `<!-- lernapps-practice-input: ${fingerprint} -->`;

/** Takes the record away (the preview is gone: the next edit builds again). */
export async function forgetFingerprint(api: Api, repo: string, issue: number): Promise<void> {
  const rows = await paginate<CommentRow>(api, `/repos/${repo}/issues/${issue}/comments`);
  for (const row of rows) {
    if (row.user?.type === "Bot" && row.body?.includes(COMMENT_MARKER) && FINGERPRINT.test(row.body)) {
      await api.request("PATCH", `/repos/${repo}/issues/comments/${row.id}`, { body: row.body.replace(FINGERPRINT, "").replace(/\n{3,}/g, "\n\n") });
    }
  }
}

/** Writes the comment with `marker`: updates the bot's comment that has it, else adds one. */
export async function upsertComment(api: Api, repo: string, issue: number, marker: string, text: string): Promise<void> {
  const path = `/repos/${repo}/issues/${issue}/comments`;
  const rows = await paginate<CommentRow>(api, path);
  const existing = rows.find((row) => row.user?.type === "Bot" && row.body?.includes(marker));
  const body = `${marker}\n${text.trim()}\n`;
  const written =
    existing === undefined
      ? await api.request("POST", path, { body })
      : await api.request("PATCH", `/repos/${repo}/issues/comments/${existing.id}`, { body });
  if (written.status !== 200 && written.status !== 201) {
    throw new Error(`cannot write the comment on #${issue} (${written.status})`);
  }
}

/** Whether the bot has written the comment with `marker` already. */
export async function hasComment(api: Api, repo: string, issue: number, marker: string): Promise<boolean> {
  const rows = await paginate<CommentRow>(api, `/repos/${repo}/issues/${issue}/comments`);
  return rows.some((row) => row.user?.type === "Bot" && row.body?.includes(marker));
}

/**
 * The address of the Pages site, always https: the setting where the token may read it (it says http while Pages does
 * not enforce https), else derived from the repository as the
 * app actions of lernapps/tooling do: https://lernapps.net/<name>/ for the organisation lernapps.
 */
export function derivedAddress(repository: string): string {
  const [owner = "", name = ""] = repository.split("/");
  if (owner.toLowerCase() === "lernapps") return `https://lernapps.net/${name}/`;
  const host = `${owner.toLowerCase()}.github.io`;
  return name.toLowerCase() === host ? `https://${host}/` : `https://${host}/${name}/`;
}

export async function pagesAddress(api: Api, repo: string): Promise<string> {
  try {
    const pages = await api.request("GET", `/repos/${repo}/pages`);
    const url = (pages.body as { html_url?: unknown } | undefined)?.html_url;
    if (pages.status === 200 && typeof url === "string") {
      const secure = url.replace(/^http:\/\//, "https://");
      return secure.endsWith("/") ? secure : `${secure}/`;
    }
  } catch {
    // the derived address
  }
  return derivedAddress(repo);
}

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/** 2026-11-10 as »10. November 2026«. */
export function germanDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])}. ${MONTHS[Number(m[2]) - 1] ?? m[2]} ${m[1]}`;
}

export function previewComment(link: string, expires: string, ready: boolean): string {
  return (
    `Deine Vorbereitung ist unter ${link} erreichbar.\n\n` +
    "So hilft sie am meisten: Dein Kind sieht zuerst selbst sein Material durch und überlegt, was es für die Arbeit " +
    "können muss. Danach zeigt ihm die App, was schon sitzt und wo noch Lücken sind. Sie prüft den Lernstand. " +
    "Das Lernen selbst ersetzt sie nicht.\n\n" +
    "Das ist eine vorübergehende Vorschau. " +
    `Sie wird nach zwei Wochen (am ${germanDate(expires)}) automatisch gelöscht. ` +
    "Wenn sie Dir oder Deinem Kind geholfen hat, setze bitte eine 👍-Reaktion auf das erste Feld dieses Issues. " +
    "Dann bleibt sie erhalten und wir prüfen, ob sie in den Katalog passt." +
    (ready ? "" : "\n\nFalls die Seite noch nicht lädt: GitHub braucht manchmal einige Minuten. Versuche es später noch einmal.")
  );
}

export function problemsComment(problems: readonly { text: string }[]): string {
  if (problems.length === 1 && problems[0]) {
    const only = problems[0].text;
    return only.startsWith("Kein ZIP gefunden") ? only : `Wir konnten Deine Vorbereitung noch nicht veröffentlichen.\n\n- ${only}\n\n${again()}`;
  }
  return (
    "Wir konnten Deine Vorbereitung noch nicht veröffentlichen. Das muss noch geändert werden:\n\n" +
    problems
      .slice(0, 12)
      .map((p) => `- ${p.text.replace(/\n+/g, " ")}`)
      .join("\n") +
    (problems.length > 12 ? `\n- … und ${problems.length - 12} weitere.` : "") +
    `\n\n${again()}`
  );
}

const again = () =>
  "Wenn Du das behoben hast, hänge die neue ZIP-Datei als Kommentar an dieses Issue an; eine Angabe des Formulars " +
  "änderst Du am ersten Feld (die drei Punkte, »Edit«). Dann prüft GitHub alles noch einmal.";

/** One line of a log for a comment: no control characters, not longer than 200 characters, no live @-mention. */
function logLine(line: string): string {
  const clean = line
    .replace(/[^\t\x20-\x7e -￿]/g, "")
    .replaceAll("```", "'''")
    .replace(/@(?=[A-Za-z0-9])/g, "@​");
  return clean.length > 200 ? `${clean.slice(0, 197)}...` : clean;
}

export const BUILD_FAILED_TEXT =
  "Beim Bauen sind Fehler aufgetreten. Gib diese Meldungen Deinem Assistenten, er korrigiert den Inhalt. " +
  "Hänge die neue ZIP-Datei als Kommentar an dieses Issue an.";

/** The messages of a failed build in a code block (at most 60 lines): nothing in it is read as Markdown or HTML. */
export function buildFailedComment(excerpt: string, runUrl: string): string {
  const lines = excerpt.split("\n").map(logLine).slice(0, 60);
  const fence = "```";
  return (
    `${BUILD_FAILED_TEXT}\n\n${fence}text\n${lines.join("\n")}\n${fence}` +
    (runUrl ? `\n\nAlle Einzelheiten stehen im [Protokoll des Laufs](${runUrl}).` : "")
  );
}

/**
 * The login of a person for an @-mention, or undefined: a GitHub login has only letters, digits and hyphens (at most
 * 39); anything else, and every bot, gets no mention.
 */
export function mentionable(login: unknown, type: unknown): string | undefined {
  if (type !== "User" || typeof login !== "string") return undefined;
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(login) ? login : undefined;
}

/** The note when a preview has expired: it names the creator (when the login is safe) and asks for feedback. */
export function expiredComment(login?: string): string {
  const mention = login !== undefined && mentionable(login, "User") === login ? `@${login} ` : "";
  return (
    `${mention}Deine Vorschau ist nach zwei Wochen gelöscht. Hat sie geholfen? ` +
    "Setze ein 👍 auf das erste Feld dieses Issues oder schreib kurz, was gut war und was gefehlt hat. " +
    "Das hilft uns und anderen.\n\n" +
    "Wenn Du die Vorschau noch einmal brauchst, hänge die ZIP-Datei erneut an (Issue bearbeiten, speichern). Dann bauen wir sie neu."
  );
}
