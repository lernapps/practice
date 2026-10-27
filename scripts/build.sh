#!/usr/bin/env bash
# Builds the site into _site/ for https://lernapps.net/practice/: German pages from docs/*.md at the root, English
# pages from docs/en/*.md below en/ (same file names), the guide for assistants (docs/llms.txt) as llms.txt, the
# architecture (docs/arc42/, English) below architecture/.
# A pull request preview (pr-preview.yml) sets SITE_PATH_PREFIX=/practice/pr-preview/pr-<number>/ and SITE_PREVIEW=1.
# The tools (marked, the shared site frame) are pinned in package.json: run `npm ci` first.
#
#   npm run build && npm run check      the site, built and checked (the job `build` in pages.yml)
#   SITE_PATH_PREFIX=/ npm run build        a local look with python3 -m http.server -d _site 8000 (then without the prefix)
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$PWD/node_modules/.bin:$PATH"
PREFIX="${SITE_PATH_PREFIX:-/practice/}"
export SITE_PATH_PREFIX="$PREFIX"

rm -rf _site
mkdir -p _site
cp site/404.html site/stil.css site/spa.css _site/
cp docs/llms.txt _site/llms.txt

# Markdown to pages (scripts/pages.mjs), German and English.
node scripts/pages.mjs docs _site

# The architecture of this repo (arc42, docs/arc42/), English only, joins before the frame so that it gets header and
# footer. The model must validate without warnings and hints. The arc42 app comes with the shared header above it: its
# fixed controls stay off the header with site/spa.css, as in lernapps/tooling.
arc42 --dir docs/arc42 validate --strict
arc42 --dir docs/arc42 build --out _site/architecture --base "${PREFIX}architecture/"
sed -i 's|</head>|<link rel="stylesheet" href="../spa.css">\n</head>|' _site/architecture/index.html

# Header, footer and language switch of all lernapps.net sites; noindex and the banner in a preview.
lernapps-frame --site /practice/ --source https://github.com/lernapps/practice --out _site
# 404.html acts only at the root of the origin; the frame must not leave a copy below en/.
rm -f _site/en/404.html
# No usage counter: this site is not one of the platform sites that count their visits (site-check forbids it).

touch _site/.nojekyll
echo "built _site/"
