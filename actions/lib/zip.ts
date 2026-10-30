// Reads a ZIP file without running anything and without trusting it: the directory is checked first (names, kinds,
// sizes), then every file is unpacked with a hard limit on its output. Only Node's own modules.
//
// What it refuses, each with a plain German sentence for the person who submitted the file (see `Problem`):
// paths outside src/, "..", absolute paths, backslashes, hidden files, names beyond a-z A-Z 0-9 - _, double endings,
// other endings than the allowed ones, links and other special files, encrypted files, ZIP64, too many or too large
// files, a directory that lies about sizes, entries that overlap (the "quine" kind of zip bomb), names that differ
// between the directory and the file header, names that differ only in case.
// Besides the content files it lets through what an explainer knows: its components in src/components/ (<Name>.vue,
// <Name>.ts, <Name>.test.ts; the build checks their code) and SVG images in src/images/, whose content svg.ts checks
// when they are unpacked. src/main.ts, the template's start, is ignored and never unpacked: the build uses the
// template's own.
import { crc32, inflateRawSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { svgProblems } from "./svg.ts";
import {
  ALLOWED_EXTENSIONS,
  COMPONENT_FILE,
  SVG_FILE,
  TEMPLATE_FILES,
  MAX_DEPTH,
  MAX_ENTRIES,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_NAME_LENGTH,
  MAX_PATH_LENGTH,
  MAX_UNPACKED_BYTES,
} from "./limits.ts";

/** A finding for the submitter: a stable code for tests and logs, a sentence in plain German. */
export interface Problem {
  code: string;
  text: string;
}

export interface Entry {
  /** The name as stored in the ZIP file (with the wrapper folder, if any). */
  name: string;
  /** The path below the unpacked folder: src/… */
  path: string;
  isDirectory: boolean;
  method: number;
  crc: number;
  compressedSize: number;
  size: number;
  /** Start of the local header and of the data. */
  headerOffset: number;
  dataOffset: number;
}

const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;
const FLAG_ENCRYPTED = 0x1 | 0x40 | 0x2000;
const S_IFMT = 0o170000;
const S_IFREG = 0o100000;
const S_IFDIR = 0o040000;

/** A name for a message: printable, short, no markup that could change a comment. */
export function show(name: string): string {
  const clean = Array.from(name)
    .map((ch) => (/[\x20-\x7e]/.test(ch) && !"`<>[]&|\\".includes(ch) ? ch : "?"))
    .join("");
  return clean.length > 50 ? `${clean.slice(0, 47)}...` : clean;
}

const problem = (code: string, text: string): Problem => ({ code, text });

const EXTENSION_HELP = (shown: string) =>
  `Die Datei \`${shown}\` hat eine nicht erlaubte Endung. Erlaubt sind: ${ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(", ")}; dazu \`.svg\` im Ordner \`src/images/\` und Komponenten (\`.vue\`, \`.ts\`) im Ordner \`src/components/\`. Anderer Programmcode (zum Beispiel \`.js\`, \`.html\`, \`.json\`) gehört nicht in eine Einreichung.`;

const HELP_ZIP =
  "Lege in Deinem Ordner alles unter einen Ordner `src` und packe dann den Ordner `src` selbst ein, nicht den Ordner darüber.";

/**
 * The reason a path of the ZIP file is not allowed, or undefined. `file` is false for a folder.
 * The checks run from the worst case to the mildest; the first that applies names the reason.
 */
export function pathProblem(name: string, file: boolean): Problem | undefined {
  const shown = show(name);
  if (name === "" || name.length > MAX_PATH_LENGTH) {
    return problem("path-length", `Der Pfad \`${shown}\` ist leer oder zu lang (höchstens ${MAX_PATH_LENGTH} Zeichen).`);
  }
  const hostile = hostileName(name);
  if (hostile) return hostile;
  const parts = (file ? name : name.replace(/\/$/, "")).split("/");
  if (parts.some((part) => part === "..")) {
    return problem("path-dotdot", `Der Pfad \`${shown}\` verlässt mit \`..\` den Ordner \`src\`. Das ist nicht erlaubt.`);
  }
  if (parts.some((part) => part === "")) {
    return problem("path-empty-part", `Der Pfad \`${shown}\` hat einen leeren Teil (doppelter Schrägstrich).`);
  }
  if (parts.some((part) => part.startsWith("."))) {
    return problem("path-hidden", `Die Datei oder der Ordner \`${shown}\` ist versteckt (der Name beginnt mit einem Punkt). Lass versteckte Dateien weg.`);
  }
  if (parts[0] !== "src") {
    return problem("path-outside-src", `Der Pfad \`${shown}\` liegt nicht im Ordner \`src\`. ${HELP_ZIP}`);
  }
  if (parts.length > MAX_DEPTH + 1) {
    return problem("path-deep", `Der Pfad \`${shown}\` ist mehr als ${MAX_DEPTH} Ordner tief.`);
  }
  if (TEMPLATE_FILES.includes(name)) {
    return problem("path-template", `\`${shown}\` ist Teil der Vorlage und gehört nicht in die entpackten Dateien.`);
  }
  if (parts[1] === "components" && (parts.length > 2 || file)) {
    if (!file || parts.length > 3) {
      return problem("component-folder", `\`${shown}\`: Im Ordner \`src/components/\` gibt es keine Unterordner.`);
    }
    if (parts.some((part) => part.length > MAX_NAME_LENGTH)) {
      return problem("name-length", `Ein Name in \`${shown}\` ist länger als ${MAX_NAME_LENGTH} Zeichen.`);
    }
    if (!COMPONENT_FILE.test(name)) {
      return problem(
        "component-name",
        `\`${shown}\` ist keine Datei einer Komponente. Im Ordner \`src/components/\` liegen nur \`<Name>.vue\`, \`<Name>.ts\` und \`<Name>.test.ts\`; der Name beginnt mit einem Großbuchstaben und hat nur Buchstaben und Ziffern (zum Beispiel \`Zahlenstrahl.vue\`).`,
      );
    }
    return undefined;
  }
  if (file && /\.svg$/i.test(name) && !SVG_FILE.test(name)) {
    return problem(
      "svg-place",
      `Das SVG-Bild \`${shown}\` liegt nicht im Ordner \`src/images/\` oder hat einen anderen Namen als Kleinbuchstaben, Ziffern und Bindestriche. SVG-Bilder gehören nach \`src/images/<name>.svg\`.`,
    );
  }
  if (SVG_FILE.test(name)) return undefined;
  const last = parts.length - 1;
  for (const [i, part] of parts.entries()) {
    if (part.length > MAX_NAME_LENGTH) {
      return problem("name-length", `Ein Name in \`${shown}\` ist länger als ${MAX_NAME_LENGTH} Zeichen.`);
    }
    const isFileName = file && i === last;
    if (!isFileName) {
      if (!/^[A-Za-z0-9_-]+$/.test(part)) {
        return problem(
          "name-characters",
          `Der Ordnername \`${shown}\` enthält andere Zeichen als a-z, A-Z, 0-9, Bindestrich und Unterstrich (kein Punkt, kein Leerzeichen, keine Umlaute).`,
        );
      }
      continue;
    }
    const dots = part.split(".").length - 1;
    const lastEnding = part.slice(part.lastIndexOf(".") + 1).toLowerCase();
    // a name that ends in a forbidden ending is told as that (BinomBild.test.ts is code), before the count of dots
    if (dots >= 1 && !ALLOWED_EXTENSIONS.includes(lastEnding)) {
      return problem(
        "extension",
        EXTENSION_HELP(shown),
      );
    }
    if (dots !== 1) {
      return problem(
        dots === 0 ? "name-no-extension" : "name-double-extension",
        dots === 0
          ? `Die Datei \`${shown}\` hat keine Endung.`
          : `Der Dateiname \`${shown}\` hat mehr als einen Punkt (zum Beispiel \`bild.png.js\`). Erlaubt ist genau eine Endung.`,
      );
    }
    const [base = "", extension = ""] = part.split(".");
    if (!/^[A-Za-z0-9_-]+$/.test(base)) {
      return problem(
        "name-characters",
        `Der Dateiname \`${shown}\` enthält andere Zeichen als a-z, A-Z, 0-9, Bindestrich und Unterstrich (kein Leerzeichen, keine Umlaute).`,
      );
    }
    if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      return problem(
        "extension",
        EXTENSION_HELP(shown),
      );
    }
  }
  return undefined;
}

function findEnd(buffer: Buffer): number {
  const lowest = Math.max(0, buffer.length - 22 - 0xffff);
  for (let i = buffer.length - 22; i >= lowest; i--) {
    if (buffer.readUInt32LE(i) === EOCD) return i;
  }
  return -1;
}

export interface Inspection {
  entries: Entry[];
  problems: Problem[];
  /** The folder around src/ that was cut off ("mathe-karte-main/"), or "" when src/ is at the root. */
  wrapper: string;
  /** Entries outside src/ that are ignored, never unpacked. */
  ignored: number;
}

interface Row {
  name: string;
  utf8: boolean;
  madeBy: number;
  flags: number;
  method: number;
  crc: number;
  compressedSize: number;
  size: number;
  externalAttributes: number;
  headerOffset: number;
}

/** What is wrong with a name whatever its place: nothing an honest tool writes. */
export function hostileName(name: string): Problem | undefined {
  const shown = show(name);
  if (/[\u0000-\u001f\u007f-\u009f]/.test(name)) {
    return problem("path-control", `Ein Pfad (\`${shown}\`) enthält ein Steuerzeichen.`);
  }
  if (name.includes("\\")) {
    return problem("path-backslash", `Der Pfad \`${shown}\` enthält einen Rückwärtsstrich. Pfade nutzen nur den Schrägstrich /.`);
  }
  if (name.startsWith("/") || /^[A-Za-z]:/.test(name)) {
    return problem("path-absolute", `Der Pfad \`${shown}\` ist ein absoluter Pfad. Das ist nicht erlaubt.`);
  }
  if (name.split("/").some((part) => part === "..")) {
    return problem("path-dotdot", `Der Pfad \`${shown}\` verlässt mit \`..\` den Ordner \`src\`. Das ist nicht erlaubt.`);
  }
  return undefined;
}

/**
 * Reads the directory of the ZIP file and checks it. Nothing is unpacked. `problems` empty means the file may be
 * unpacked. Only what lies in src/ counts: src/ at the root of the ZIP file, or in the one folder around everything
 * (a GitHub "Download ZIP"). Everything else in the file is ignored and never unpacked; only a name that no honest
 * tool writes (control characters, backslash, absolute path, "..") is refused wherever it is.
 */
export function inspectZip(buffer: Buffer): Inspection {
  const problems: Problem[] = [];
  const stop = (p: Problem): Inspection => ({ entries: [], problems: [p], wrapper: "", ignored: 0 });
  if (buffer.length < 22) return stop(problem("not-zip", "Die Datei ist keine ZIP-Datei oder sie ist leer."));
  const end = findEnd(buffer);
  if (end < 0) return stop(problem("not-zip", "Die Datei ist keine ZIP-Datei (oder sie ist beschädigt)."));
  const disk = buffer.readUInt16LE(end + 4);
  const diskWithDirectory = buffer.readUInt16LE(end + 6);
  const countOnDisk = buffer.readUInt16LE(end + 8);
  const count = buffer.readUInt16LE(end + 10);
  const directorySize = buffer.readUInt32LE(end + 12);
  const directoryOffset = buffer.readUInt32LE(end + 16);
  if (count === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff) {
    return stop(problem("zip64", "Die ZIP-Datei nutzt das Format ZIP64. Sie ist für diese Einreichung viel zu groß."));
  }
  if (disk !== 0 || diskWithDirectory !== 0 || countOnDisk !== count) {
    return stop(problem("multi-disk", "Die ZIP-Datei ist auf mehrere Dateien verteilt. Das geht nicht."));
  }
  if (count === 0) return stop(problem("empty", "Die ZIP-Datei enthält keine Dateien."));
  if (count > MAX_ENTRIES) {
    return stop(problem("too-many-entries", `Die ZIP-Datei enthält mehr als ${MAX_ENTRIES} Einträge.`));
  }
  if (directoryOffset + directorySize > end) {
    return stop(problem("directory", "Das Verzeichnis der ZIP-Datei ist beschädigt."));
  }

  // Pass 1: the directory as rows.
  const strict = new TextDecoder("utf-8", { fatal: true });
  const rows: Row[] = [];
  let at = directoryOffset;
  for (let i = 0; i < count; i++) {
    if (at + 46 > directoryOffset + directorySize || buffer.readUInt32LE(at) !== CENTRAL) {
      return stop(problem("directory", "Das Verzeichnis der ZIP-Datei ist beschädigt."));
    }
    const nameLength = buffer.readUInt16LE(at + 28);
    const next = at + 46 + nameLength + buffer.readUInt16LE(at + 30) + buffer.readUInt16LE(at + 32);
    if (next > directoryOffset + directorySize) {
      return stop(problem("directory", "Das Verzeichnis der ZIP-Datei ist beschädigt."));
    }
    const nameBytes = buffer.subarray(at + 46, at + 46 + nameLength);
    let name: string;
    let utf8 = true;
    try {
      name = strict.decode(nameBytes);
    } catch {
      name = nameBytes.toString("latin1");
      utf8 = false;
    }
    rows.push({
      name,
      utf8,
      madeBy: buffer.readUInt16LE(at + 4),
      flags: buffer.readUInt16LE(at + 8),
      method: buffer.readUInt16LE(at + 10),
      crc: buffer.readUInt32LE(at + 16),
      compressedSize: buffer.readUInt32LE(at + 20),
      size: buffer.readUInt32LE(at + 24),
      externalAttributes: buffer.readUInt32LE(at + 38),
      headerOffset: buffer.readUInt32LE(at + 42),
    });
    at = next;
  }

  // Where is src/? At the root, or inside the one folder that holds everything.
  const tops = new Set(rows.map((row) => row.name.split("/")[0] ?? ""));
  let wrapper = "";
  if (!tops.has("src")) {
    const only = tops.size === 1 ? [...tops][0] : undefined;
    if (only !== undefined && only !== "" && rows.some((row) => row.name.startsWith(`${only}/src/`) || row.name === `${only}/src`)) {
      wrapper = `${only}/`;
    } else {
      const names = [...tops].filter((t) => t !== "").slice(0, 4).map((t) => `\`${show(t)}\``);
      return stop(
        problem(
          "no-src",
          `In der ZIP-Datei fehlt der Ordner \`src\` (oben stehen: ${names.join(", ") || "nichts"}). ${HELP_ZIP}`,
        ),
      );
    }
  }

  // Pass 2: every row is hostile, ignored (outside src/), or an entry of src/ that is checked strictly.
  const entries: Entry[] = [];
  let ignored = 0;
  for (const row of rows) {
    const hostile = hostileName(row.name);
    if (hostile) {
      problems.push(hostile);
      continue;
    }
    const inside = row.name.startsWith(wrapper) ? row.name.slice(wrapper.length) : undefined;
    if (inside === undefined || !(inside === "src/" || inside.startsWith("src/"))) {
      ignored++;
      continue;
    }
    if (TEMPLATE_FILES.includes(inside)) {
      // the template's start, written by create into every app: the build uses the template's own
      ignored++;
      continue;
    }
    const { name: full, madeBy, flags, method, crc, compressedSize, size, externalAttributes, headerOffset } = row;
    const name = inside;
    const shown = show(name);
    if (!row.utf8) {
      problems.push(problem("name-encoding", `Der Name \`${shown}\` in der ZIP-Datei ist kein gültiger UTF-8-Text.`));
      continue;
    }
    if (compressedSize === 0xffffffff || size === 0xffffffff || headerOffset === 0xffffffff) {
      return stop(problem("zip64", "Die ZIP-Datei nutzt das Format ZIP64. Sie ist für diese Einreichung viel zu groß."));
    }
    const isDirectory = name.endsWith("/");

    // Kind: a regular file or a folder; never a link, a device or another special file.
    if (madeBy >> 8 === 3) {
      const kind = (externalAttributes >>> 16) & S_IFMT;
      if (kind !== 0 && kind !== S_IFREG && kind !== S_IFDIR) {
        problems.push(problem("special-file", `\`${shown}\` ist ein Link oder eine andere besondere Datei. Erlaubt sind nur normale Dateien und Ordner.`));
        continue;
      }
      if (kind === S_IFDIR && !isDirectory) {
        problems.push(problem("special-file", `\`${shown}\` ist als Ordner markiert, hat aber keinen Schrägstrich am Ende.`));
        continue;
      }
    } else if ((externalAttributes & 0x400) !== 0) {
      problems.push(problem("special-file", `\`${shown}\` ist ein Link oder eine andere besondere Datei.`));
      continue;
    }
    if ((flags & FLAG_ENCRYPTED) !== 0) {
      problems.push(problem("encrypted", `Die Datei \`${shown}\` ist verschlüsselt (mit Passwort). Das geht nicht.`));
      continue;
    }
    if (method !== 0 && method !== 8) {
      problems.push(problem("method", `Die Datei \`${shown}\` ist auf eine nicht unterstützte Art gepackt.`));
      continue;
    }
    const bad = pathProblem(name, !isDirectory);
    if (bad) {
      problems.push(bad);
      continue;
    }
    if (isDirectory && (size !== 0 || compressedSize > 2)) {
      problems.push(problem("directory-size", `Der Ordner \`${shown}\` hat einen Inhalt. Das ist nicht erlaubt.`));
      continue;
    }
    if (size > MAX_FILE_BYTES) {
      problems.push(problem("file-too-large", `Die Datei \`${shown}\` ist entpackt größer als ${MAX_FILE_BYTES / 1024 / 1024} MB.`));
      continue;
    }
    if (method === 0 && size !== compressedSize) {
      problems.push(problem("size-mismatch", `Die Größe der Datei \`${shown}\` stimmt nicht. Die ZIP-Datei ist beschädigt.`));
      continue;
    }
    entries.push({ name: full, path: name, isDirectory, method, crc, compressedSize, size, headerOffset, dataOffset: -1 });
  }

  const files = entries.filter((entry) => !entry.isDirectory);
  if (files.length > MAX_FILES) {
    problems.push(problem("too-many-files", `Im Ordner \`src\` liegen ${files.length} Dateien. Erlaubt sind höchstens ${MAX_FILES}.`));
  }
  const unpacked = files.reduce((sum, entry) => sum + entry.size, 0);
  if (unpacked > MAX_UNPACKED_BYTES) {
    problems.push(problem("too-large", `Entpackt sind die Dateien zusammen größer als ${MAX_UNPACKED_BYTES / 1024 / 1024} MB.`));
  }

  // Names that differ only in case or form are one name on some systems.
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const key = entry.path.normalize("NFKC").toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) {
      problems.push(problem("duplicate", `Der Name \`${show(entry.path)}\` kommt doppelt vor (auch Groß- und Kleinschreibung zählt als gleich).`));
    }
    seen.set(key, entry.path);
  }
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    if (entries.some((other) => other !== entry && other.path.startsWith(`${entry.path}/`))) {
      problems.push(problem("file-and-folder", `\`${show(entry.path)}\` ist zugleich Datei und Ordner.`));
    }
  }
  if (!files.some((entry) => entry.path === "src/app.yaml")) {
    problems.push(
      problem("no-app-yaml", `Die Datei \`src/app.yaml\` fehlt. Sie beschreibt die App (Titel, Kapitel). ${HELP_ZIP}`),
    );
  }
  if (!files.some((entry) => entry.path === "src/scope.md")) {
    problems.push(
      problem(
        "no-scope",
        `Die Datei \`src/scope.md\` fehlt. Mit ihr misst der KI-Tutor offene Antworten am Lernstoff statt an Allgemeinwissen: Sie beschreibt den ganzen Stoff in eigenen Worten, Seite für Seite, und was dazugehört und was nicht. ${HELP_ZIP}`,
      ),
    );
  }

  // The local headers: where each file's data starts, that its name is the same as in the directory, and that no
  // two used entries share bytes.
  const ranges: { start: number; end: number }[] = [];
  for (const entry of entries) {
    const header = entry.headerOffset;
    if (header + 30 > directoryOffset || buffer.readUInt32LE(header) !== LOCAL) {
      problems.push(problem("local-header", `Der Eintrag \`${show(entry.path)}\` ist beschädigt.`));
      continue;
    }
    const nameLength = buffer.readUInt16LE(header + 26);
    const extraLength = buffer.readUInt16LE(header + 28);
    const localName = buffer.subarray(header + 30, header + 30 + nameLength).toString("utf8");
    if (localName !== entry.name) {
      problems.push(problem("local-name", `Der Name des Eintrags \`${show(entry.path)}\` ist an zwei Stellen verschieden.`));
      continue;
    }
    entry.dataOffset = header + 30 + nameLength + extraLength;
    const dataEnd = entry.dataOffset + entry.compressedSize;
    if (dataEnd > directoryOffset) {
      problems.push(problem("local-header", `Der Eintrag \`${show(entry.path)}\` ist beschädigt.`));
      continue;
    }
    ranges.push({ start: header, end: dataEnd });
  }
  ranges.sort((a, b) => a.start - b.start);
  for (let i = 1; i < ranges.length; i++) {
    const before = ranges[i - 1];
    const here = ranges[i];
    if (before && here && here.start < before.end) {
      problems.push(problem("overlap", "Einträge der ZIP-Datei überlappen sich. Die Datei ist beschädigt oder absichtlich so gebaut."));
      break;
    }
  }
  return { entries, problems: collapse(problems), wrapper, ignored };
}

/** One problem per code: the first, with the number of the others, so that a long list does not drown the message. */
export function collapse(problems: readonly Problem[]): Problem[] {
  const counts = new Map<string, number>();
  for (const p of problems) counts.set(p.code, (counts.get(p.code) ?? 0) + 1);
  const done = new Set<string>();
  const result: Problem[] = [];
  for (const p of problems) {
    if (done.has(p.code)) continue;
    done.add(p.code);
    const more = (counts.get(p.code) ?? 1) - 1;
    result.push(more > 0 ? { code: p.code, text: `${p.text} (Das trifft noch auf ${more} weitere Dateien zu.)` } : p);
  }
  return result;
}

/**
 * Unpacks the files of an inspected ZIP file into `target`. Every file is inflated with a limit of its stated size,
 * and must come out with exactly that size and the stated checksum; an SVG image must pass the content check
 * (svg.ts). Returns problems (a lying directory, an SVG that does more than draw); on any problem the caller discards
 * `target`.
 */
export function extractZip(buffer: Buffer, entries: readonly Entry[], target: string): Problem[] {
  const problems: Problem[] = [];
  let total = 0;
  for (const entry of entries) {
    if (entry.isDirectory) {
      mkdirSync(join(target, entry.path), { recursive: true });
      continue;
    }
    const raw = buffer.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
    let data: Buffer;
    if (entry.method === 0) {
      data = Buffer.from(raw);
    } else {
      try {
        data = inflateRawSync(raw, { maxOutputLength: Math.max(entry.size, 1) });
      } catch {
        problems.push(
          problem("bomb", `Die Datei \`${show(entry.path)}\` ist beim Entpacken größer als angegeben. Sie wird nicht entpackt.`),
        );
        return problems;
      }
    }
    total += data.length;
    if (data.length !== entry.size || total > MAX_UNPACKED_BYTES) {
      problems.push(problem("size-mismatch", `Die Größe der Datei \`${show(entry.path)}\` stimmt nicht mit dem Verzeichnis überein.`));
      return problems;
    }
    if (crc32(data) !== entry.crc) {
      problems.push(problem("checksum", `Die Datei \`${show(entry.path)}\` ist beschädigt (Prüfsumme falsch).`));
      return problems;
    }
    if (/\.svg$/i.test(entry.path)) {
      // an image that would run or load something when opened is not unpacked; the others go on, so that the
      // comment names every such image at once
      const found = svgProblems(show(entry.path), data);
      if (found.length > 0) {
        problems.push(...found);
        continue;
      }
    }
    const path = join(target, entry.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data, { flag: "wx" });
  }
  return collapse(problems);
}
