// Renders the Markdown pages into HTML pages: docs/*.md to <out>/<name>/index.html (index.md to <out>/index.html),
// docs/en/*.md the same below <out>/en/. The header, footer and language switch come later (lernapps-frame).
//
//   node scripts/pages.mjs docs _site
//
// Rules for the Markdown:
//   - A heading may end with {#anchor}. German and English pages use the same anchors.
//   - A link to another page is written as the file name (regeln.md, einreichen.md#formular); it becomes the address
//     of the page in the same language, with the prefix of the build (SITE_PATH_PREFIX). llms.txt is the guide for assistants, architecture/ the architecture (English only).
//   - The first # heading is the title, the first paragraph the description.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Marked } from "marked";

const [docs, out] = process.argv.slice(2);
if (!docs || !out) {
  console.error("usage: node scripts/pages.mjs <docs folder> <out folder>");
  process.exit(2);
}
const prefix = process.env.SITE_PATH_PREFIX ?? "/practice/";

const LANGUAGES = {
  de: { dir: docs, root: "", home: "Vorbereitung üben", back: "Zur Startseite", suffix: "Vorbereitung üben – lernapps.net" },
  en: { dir: join(docs, "en"), root: "en/", home: "Practise for a test", back: "To the start page", suffix: "Practise for a test – lernapps.net" },
};

const escapeHtml = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const plain = (text) => text.replace(/`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_]/g, "");

function render(markdown, lang) {
  const { root } = LANGUAGES[lang];
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        let text = this.parser.parseInline(tokens);
        const anchor = /\s*\{#([a-z0-9-]+)\}\s*$/.exec(text);
        if (anchor) text = text.slice(0, anchor.index);
        return `<h${depth}${anchor ? ` id="${anchor[1]}"` : ""}>${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const page = /^([a-z0-9-]+)\.md(#[a-z0-9-]+)?$/.exec(href);
        if (page) href = `${prefix}${root}${page[1] === "index" ? "" : `${page[1]}/`}${page[2] ?? ""}`;
        else if (href === "llms.txt") href = `${prefix}llms.txt`;
        else if (href === "architecture/") href = `${prefix}architecture/`;
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(href)}"${t}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  return marked.parse(markdown);
}

let count = 0;
for (const [lang, { dir, root, home, back, suffix }] of Object.entries(LANGUAGES)) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const name = file.slice(0, -3);
    const markdown = readFileSync(join(dir, file), "utf8");
    const title = /^# (.+)$/m.exec(markdown)?.[1];
    if (!title) throw new Error(`${join(dir, file)}: no # heading`);
    const description = plain(markdown.split(/\n{2,}/).find((p) => p.trim() && !p.startsWith("#")) ?? "").replace(/\s+/g, " ").trim();
    const isHome = name === "index";
    const nav = isHome ? "" : `<p class="zurueck"><a href="${prefix}${root}">${escapeHtml(back)}: ${escapeHtml(home)}</a></p>\n`;
    const page = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(isHome ? suffix : `${plain(title)} – ${suffix}`)}</title>
  <link rel="stylesheet" href="${prefix}stil.css">
</head>
<body>
  <main id="main-content" tabindex="-1">
${nav}${render(markdown, lang)}  </main>
</body>
</html>
`;
    const target = join(out, root, isHome ? "" : name);
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, "index.html"), page);
    count++;
  }
}
console.log(`pages: ${count} pages`);
