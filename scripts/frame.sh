#!/usr/bin/env bash
# Runs a command of the shared site frame (@lernapps/site) for this site: `frame.sh inject ...` is lernapps-frame,
# `frame.sh check ...` is site-check.
#
# The pinned frame does not know /practice/ yet: its lists SITES and TRANSLATED_SITES (site-frame/nav.js) name the
# sites of lernapps.net, and without the entry /practice/en/ is not read as English. Until the frame has the entry
# (a change in lernapps/lernapps.github.io), this script runs a copy of the frame in _frame/ with the entry added.
# When the pinned frame has "/practice/" in nav.js, the copy is the frame as it is, and this script can go: call
# lernapps-frame and site-check from package.json and build.sh directly.
set -euo pipefail
cd "$(dirname "$0")/.."
src="node_modules/@lernapps/site/site-frame"
[ -d "$src" ] || { echo "frame.sh: run npm ci first" >&2; exit 1; }
rm -rf _frame
cp -r "$src" _frame
if ! grep -q '"/practice/"' _frame/nav.js; then
  sed -i -E '/^export const (SITES|TRANSLATED_SITES) = \[/ s#\[#["/practice/", #' _frame/nav.js
  grep -c '"/practice/"' _frame/nav.js | grep -qx 2 || { echo "frame.sh: could not add /practice/ to nav.js" >&2; exit 1; }
fi
command="$1"
shift
case "$command" in
  inject) exec node _frame/inject.mjs "$@" ;;
  check) exec node _frame/check.mjs "$@" ;;
  *) echo "usage: frame.sh inject|check <arguments of the command>" >&2; exit 2 ;;
esac
