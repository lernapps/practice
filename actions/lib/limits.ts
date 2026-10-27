// The limits of a submission in one place. docs/regeln.md names the same numbers for people; test/limits.test.ts
// keeps the two in step.

/** The ZIP file as downloaded. */
export const MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024;
/** Seconds the download may take. */
export const DOWNLOAD_TIMEOUT_SECONDS = 60;
/** Files in the ZIP file (folders do not count). */
export const MAX_FILES = 300;
/** All entries of the ZIP file, folders included (a whole project has many): bounds the work of reading the directory. */
export const MAX_ENTRIES = 20000;
/** All files together, unpacked. */
export const MAX_UNPACKED_BYTES = 25 * 1024 * 1024;
/** One file, unpacked. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** A path is src/ plus at most this many folders and the file name. */
export const MAX_DEPTH = 6;
/** Characters of a whole path and of one name. */
export const MAX_PATH_LENGTH = 150;
export const MAX_NAME_LENGTH = 60;

/** The endings of the files a submission may hold, in lower case. */
export const ALLOWED_EXTENSIONS: readonly string[] = ["yaml", "yml", "md", "png", "jpg", "webp"];

/**
 * The files of an explainer's components, as the explainer knows them: <Name>.vue, its logic <Name>.ts and its test
 * <Name>.test.ts, Name in PascalCase, directly in src/components/. The build checks their code.
 */
export const COMPONENT_FILE = /^src\/components\/[A-Z][A-Za-z0-9]*(\.test\.ts|\.ts|\.vue)$/;
/** An SVG image: only directly in src/images/, with a name as the explainer wants it. svg.ts checks its content. */
export const SVG_FILE = /^src\/images\/[a-z0-9]+(-[a-z0-9]+)*\.svg$/;
/** Files of the template that create writes into every app: ignored in a ZIP file, never unpacked. */
export const TEMPLATE_FILES: readonly string[] = ["src/main.ts"];

/** The preview is served for this long. */
export const LIFETIME_DAYS = 14;

/** The built site that publish writes: files, bytes, and the endings it may hold. */
export const MAX_SITE_FILES = 600;
export const MAX_SITE_BYTES = 50 * 1024 * 1024;
export const SITE_EXTENSIONS: readonly string[] = [
  "html",
  "css",
  "js",
  "mjs",
  "json",
  "md",
  "txt",
  "png",
  "jpg",
  "webp",
  "svg",
  "woff2",
  "ico",
  "webmanifest",
];

/** The labels (level-3 headings) of the issue form `.github/ISSUE_TEMPLATE/einreichen.yml`. */
export const FORM_LABELS = ["Fach", "Klassenstufe", "Bundesland", "ZIP-Datei", "Erklärungen"] as const;

export const GRADES: readonly string[] = Array.from({ length: 13 }, (_, i) => String(i + 1));

export const STATES: readonly string[] = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export const MAX_SUBJECT_LENGTH = 60;
