#!/usr/bin/env bash
# Builds the site into _site/ for https://lernapps.net/practice/: German pages from docs/*.md at the root, English
# pages from docs/en/*.md below en/ (same file names), the guide for assistants (docs/llms.txt) as llms.txt.
# A pull request preview (pr-preview.yml) sets SITE_PATH_PREFIX=/practice/pr-preview/pr-<number>/ and SITE_PREVIEW=1.
# The tools (marked, the shared site frame) are pinned in package.json: run `npm ci` first.
#
#   npm run build && npm run check      the site, built and checked (the job `build` in pages.yml)
#   python3 -m http.server -d _site 8000   a local look; links assume the /practice/ prefix (see README)
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$PWD/node_modules/.bin:$PATH"
PREFIX="${SITE_PATH_PREFIX:-/practice/}"
export SITE_PATH_PREFIX="$PREFIX"

rm -rf _site
mkdir -p _site
cp site/404.html site/stil.css _site/
cp docs/llms.txt _site/llms.txt

# Markdown to pages (scripts/pages.mjs), German and English.
node scripts/pages.mjs docs _site

# Planned: the architecture of this repo (arc42) joins here, before the frame, so that it gets header and footer:
#   arc42 --dir docs/arc42 validate
#   arc42 --dir docs/arc42 build --out _site/architecture --base "${PREFIX}architecture/"
# It needs "@doctc/arc42" in package.json (devDependencies) and, as in lernapps/tooling, the stylesheet spa.css
# linked into _site/architecture/index.html, so that the fixed controls of the app stay off the header.

# Header, footer and language switch of all lernapps.net sites; noindex and the banner in a preview.
./scripts/frame.sh inject --site /practice/ --source https://github.com/lernapps/practice --out _site
# 404.html acts only at the root of the origin; the frame must not leave a copy below en/.
rm -f _site/en/404.html
# No usage counter: this site is not one of the platform sites that count their visits (site-check forbids it).

touch _site/.nojekyll
echo "built _site/"
