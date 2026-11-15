# Animated Story Studio

By **Nainik Mehta**. Vertical (1080×1920, 30 fps) animated story shorts built with Remotion and TypeScript.
Characters and scenery are SVG drawn in code, so a new story is mostly a script, a voice-over and timings.

The working rules and the full how-to are in **[CLAUDE.md](CLAUDE.md)**. Short version: script first,
storyboard stills before any full render, deities always shown with calm and respectful faces,
captions inside the safe zone.

## Requirements

| Tool | Version | Used for |
|---|---|---|
| Node.js | 20+ | Remotion |
| Google Chrome / Chromium | any recent | rendering (Remotion downloads its own if needed) |
| ffmpeg | any recent | audio mixing and video checks |
| Python | 3.10+ | word timings |

Word timings need a Python virtual environment at `~/.venvs/whisper`:

```bash
python3.12 -m venv ~/.venvs/whisper
~/.venvs/whisper/bin/pip install -r tools/requirements.txt
```

## Quick start

```bash
npm install
npm run studio          # live preview in the browser
npm run render:test     # 3 s test: the rig walking across the hills -> out/rig-test.mp4
```

## Commands

| Command | What it does |
|---|---|
| `npm run studio` | Remotion live preview |
| `npm run storyboard -- <CompId> <frame>...` | Render stills (safe-zone guide on) into `out/storyboard/` |
| `npm run render:test` | Render the 3-second rig test |
| `npm run timings -- voice/x.mp3 --out stories/x/timings.json` | Voice-over → JSON of every word with start/end seconds |
| `npm run typecheck` | TypeScript check (also flags unused code) |

## Project layout

```
stories/<slug>/   one folder per story (script, storyboard, timings, Story.tsx); _template/ to copy
voice/ music/ sfx/   audio inputs
out/              renders and storyboard stills (git-ignored)
src/
  lib/            size/fps/safe zone, palettes, captions, SvgLayer
  rig/            Character (head, body, arms, legs, cloth; walk, wave, blink, breathe) and looks
  scenery/        sky, moon, hills + trees, clouds, diyas, sparks, petals
  compositions/   RigTest demo
tools/            timings.py, storyboard.sh, requirements.txt
.claude/skills/   cartoon-3d-short skill (separate three.js style)
```

## Licence

MIT, see `LICENSE` and `THIRD_PARTY_NOTICES.md`.
