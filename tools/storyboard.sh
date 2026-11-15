#!/usr/bin/env bash
# Storyboard stills: render single frames (with the safe-zone guide) so a story can be
# checked BEFORE any full render.
#
#   npm run storyboard -- <CompositionId> <frame> [<frame> ...]
#   npm run storyboard -- RigTest 0 30 60 89
#
# Output: out/storyboard/<CompositionId>-<frame>.png
set -euo pipefail
cd "$(dirname "$0")/.."

if [ $# -lt 2 ]; then
  echo "usage: npm run storyboard -- <CompositionId> <frame> [<frame> ...]" >&2
  exit 1
fi

ID="$1"; shift
mkdir -p out/storyboard
for F in "$@"; do
  npx remotion still src/index.ts "$ID" "out/storyboard/${ID}-${F}.png" --frame="$F" --props='{"guides":true}'
done
echo "storyboard stills are in out/storyboard/"
