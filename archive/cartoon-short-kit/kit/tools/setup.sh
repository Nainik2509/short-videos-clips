#!/usr/bin/env bash
# Cartoon Short Kit - (c) 2026 Nainik Mehta. MIT License.
# Creates a new short project:  bash kit/tools/setup.sh <project_dir>
# Needs: node >= 22.6 (type stripping), python3 + numpy + Pillow, ffmpeg, Playwright Chromium
#        (npm i -g playwright && npx playwright install chromium).
# No network needed: three.js and the toon drawing base are vendored in kit/vendor/.
set -euo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"; P="${1:?usage: setup.sh <project_dir>}"
mkdir -p "$P/web/lib" "$P/work" "$P/stills" "$P/out"
cp "$KIT"/engine/*.js "$KIT"/engine/index.html "$P/web/"
cp "$KIT"/example/soldier/story.js "$P/web/story.js"   # starting point: rewrite for the new story
cp "$KIT"/example/soldier/audio.py "$P/audio.py"       # starting point: rewrite the cue table
cp "$KIT"/tools/render.mjs "$KIT"/tools/*.py "$KIT"/tools/finish.sh "$P/"
cp "$KIT"/vendor/three.module.js "$P/web/lib/three.module.js"
node -e "const m=require('node:module'),fs=require('fs');fs.writeFileSync(process.argv[2]+'/web/toonbase.js',m.stripTypeScriptTypes(fs.readFileSync(process.argv[1]+'/vendor/toon.ts','utf8')))" "$KIT" "$P"
cat "$P/web/toonbase.js" "$P/web/roman.js" > "$P/web/toon.js"
# Playwright: link a global install if present, otherwise install it locally in the project.
if [ ! -e "$P/node_modules/playwright" ]; then
  G="$(npm root -g)/playwright"
  if [ -d "$G" ]; then mkdir -p "$P/node_modules" && ln -sf "$G" "$P/node_modules/playwright"
  else (cd "$P" && npm init -y >/dev/null 2>&1 && npm i playwright >/dev/null 2>&1) || echo "WARN: install Playwright manually: npm i playwright && npx playwright install chromium"; fi
fi
echo "ready: $P   (after editing cast code run: cat web/toonbase.js web/roman.js > web/toon.js)"
