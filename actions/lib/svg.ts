// The content check of an SVG image of a submission (src/images/<name>.svg). An SVG file is a document that a browser
// runs when someone opens it on its own, on the origin of lernapps.net, which the previews share with the platform
// (con-shared-origin). So an SVG may hold drawing only: no script, no event attribute, no embedded document, no
// reference to anything outside the file. A reference inside the file (href="#arrow", url(#shade)) is fine.
//
// The check is deliberately coarse: it looks at the text, raw and with character references decoded, and refuses
// whatever looks like one of the forbidden things, also in a comment. A drawing never needs any of them.
import type { Problem } from "./zip.ts";

/** The text with numeric character references (&#106; &#x6a;) and the five XML entities decoded. */
export function decodeReferences(text: string): string {
  return text
    .replace(/&#x([0-9a-f]{1,6});?/gi, (_m, hex: string) => safeChar(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]{1,7});?/g, (_m, dec: string) => safeChar(Number.parseInt(dec, 10)))
    .replace(/&(lt|gt|quot|apos|amp);/gi, (_m, name: string) => ({ lt: "<", gt: ">", quot: '"', apos: "'", amp: "&" })[name.toLowerCase()] ?? "");
}

const safeChar = (code: number): string => (code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "");

/** The tags of a text: everything between < and the next >. */
const tags = (text: string): string[] => text.match(/<[^>]*>?/g) ?? [];

/** The values of the attributes `name` (with or without a prefix such as xlink:) in the tags of a text. */
function attributeValues(text: string, name: RegExp): string[] {
  const values: string[] = [];
  for (const tag of tags(text)) {
    const pattern = new RegExp(`\\s(?:[\\w-]+:)?(?:${name.source})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "gi");
    for (const match of tag.matchAll(pattern)) values.push((match[1] ?? match[2] ?? match[3] ?? "").trim());
  }
  return values;
}

/** Whether a reference points into the same file: "#id", nothing else. */
const internal = (value: string): boolean => /^#[^\s#]*$/.test(value.replace(/\s+/g, ""));

/**
 * The problems of the SVG file `path` (as shown in a message) with the bytes `data`; empty when it is a plain
 * drawing. One problem per kind, in plain German, each saying what to remove.
 */
export function svgProblems(path: string, data: Buffer): Problem[] {
  let raw: string;
  try {
    raw = new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return [{ code: "svg-encoding", text: `Das Bild \`${path}\` ist kein Text in UTF-8. Speichere das SVG als UTF-8.` }];
  }
  if (!/<svg[\s/>]/i.test(raw)) {
    return [{ code: "svg-not-svg", text: `Die Datei \`${path}\` ist kein SVG-Bild (es fehlt \`<svg\`).` }];
  }
  const decoded = decodeReferences(raw);
  // without blanks and control characters: "java&#9;script:" and "java script:" are the same to a browser
  const compact = decoded.replace(/[\s\u0000-\u001f]+/g, "");
  const found: Problem[] = [];
  const refuse = (code: string, what: string) => {
    if (!found.some((p) => p.code === code)) {
      found.push({ code, text: `Das Bild \`${path}\` enthält ${what}. Ein Bild darf nur zeichnen. Entferne das und reiche neu ein.` });
    }
  };
  for (const text of [raw, decoded]) {
    if (/<\s*script/i.test(text)) refuse("svg-script", "ein Skript (`<script>`)");
    if (/<\s*foreignObject/i.test(text)) refuse("svg-foreign-object", "eingebettetes HTML (`<foreignObject>`)");
    if (/<\s*(iframe|embed|object)\b/i.test(text)) refuse("svg-embedded", "ein eingebettetes Dokument (`<iframe>`, `<embed>` oder `<object>`)");
    if (/<!ENTITY/i.test(text)) refuse("svg-entity", "eine Entity-Definition (`<!ENTITY`)");
    if (tags(text).some((tag) => /[\s/"']on[a-z0-9_-]*\s*=/i.test(tag))) {
      refuse("svg-event", "ein Ereignis-Attribut (zum Beispiel `onload=` oder `onclick=`)");
    }
    if (attributeValues(text, /href/).some((value) => !internal(value))) {
      refuse("svg-external", "einen Verweis nach außen (`href` auf etwas anderes als `#…`)");
    }
    for (const match of text.matchAll(/url\s*\(\s*["']?([^)"']*)/gi)) {
      if (!internal(match[1] ?? "")) refuse("svg-external", "einen Verweis nach außen (`url(…)` auf etwas anderes als `#…`)");
    }
    if (/@import/i.test(text)) refuse("svg-external", "einen Verweis nach außen (`@import`)");
    // any other attribute that names an address (src=, to="https://…" of an animation, xml:base); xmlns names a
    // vocabulary and loads nothing
    const addresses = tags(text).flatMap((tag) =>
      [...tag.matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
        .filter((m) => !/^xmlns(:|$)/i.test(m[1] ?? ""))
        .map((m) => m[2] ?? m[3] ?? ""),
    );
    if (addresses.some((value) => /^\s*(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) || /^\s*data:/i.test(value))) {
      refuse("svg-external", "einen Verweis nach außen (eine Adresse in einem Attribut)");
    }
  }
  if (/javascript:/i.test(compact)) refuse("svg-javascript", "einen Verweis auf JavaScript (`javascript:`)");
  return found;
}
