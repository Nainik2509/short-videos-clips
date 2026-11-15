# Animated Story Studio

Vertical animated story shorts (**1080×1920, 30 fps**) built with Remotion + TypeScript.
Characters and scenery are drawn in SVG code, so every frame is deterministic and re-colourable.

## The rules (read first)

1. **Script first.** No code, no storyboard, no render until the story has a written script in
   `stories/<slug>/script.md` and the user has approved it.
2. **Storyboard before any full render.** Render stills (`npm run storyboard`) for every scene,
   look at them, and fix problems before running a full video render. Only then render the video.
3. **Deities are shown with calm, respectful faces.** Always use a look with `sacred: true`
   (it locks the face to a calm, half-lidded, softly closed-mouth expression). Never make them
   comic, angry, scared, silly, or put them in funny poses. No jokes at their expense. Dress them
   in full, dignified clothing with a halo/crown. Narration about them stays reverent.
4. **Captions stay inside the safe zone.** Use `<Captions>` (it already sits on the safe-zone floor).
   Safe zone = `SAFE` in `src/lib/theme.ts`: 220 px from the top, 440 px from the bottom,
   80 px left, 140 px right. Check with `<SafeZoneGuide />` (the storyboard command turns it on).
5. Everything is 1080×1920 @ 30 fps. Do not register compositions with other sizes.

## Layout

```
stories/<slug>/      one folder per story: script.md, storyboard.md, timings.json, Story.tsx
voice/               voice-over recordings (<slug>.mp3 / .wav)
music/               background music
sfx/                 sound effects
out/                 renders and storyboard stills (git-ignored)
src/
  Root.tsx           registers compositions
  lib/               theme.ts (size, fps, SAFE zone), palettes.tsx, Captions.tsx
  rig/               Character.tsx (the SVG character), looks.ts (colours/outfits/presets)
  scenery/           Sky, Moon, HillLayer (+trees), Clouds, Diya/DiyaTrail, Sparks, Petals, terrain.ts
  compositions/      RigTest.tsx (the 3 s demo)
tools/
  timings.py         voice-over -> word timings JSON (faster-whisper)
  storyboard.sh      render stills of chosen frames, with the safe-zone guide on
archive/             the previous three.js cartoon kit and skill copy (kept for reference, not used)
.claude/skills/      the cartoon-3d-short skill (a different, three.js style)
```

## How a story is made (always in this order)

1. **Script** – write `stories/<slug>/script.md`: title, 55–70 s of narration split into short scenes,
   one line per scene saying what is on screen. Get approval.
2. **Voice-over** – the user records it into `voice/<slug>.mp3`.
3. **Word timings** – `npm run timings -- voice/<slug>.mp3 --out stories/<slug>/timings.json`
   (uses faster-whisper from `~/.venvs/whisper`; add `--language hi` for Hindi, `--prompt "names..."` to fix spellings).
4. **Storyboard** – write `stories/<slug>/storyboard.md` (scene → start/end frame → characters, backdrop, camera).
   Build `stories/<slug>/Story.tsx`, register it in `src/Root.tsx`, then
   `npm run storyboard -- <CompId> <frame> <frame> ...` and view `out/storyboard/*.png`.
5. **Full render** – only after the stills are approved:
   `npx remotion render src/index.ts <CompId> out/<slug>.mp4`
6. Mix voice, music (about half the voice level) and sfx, then check the captions and safe zone on the final video.

Convert seconds to frames with `Math.round(seconds * FPS)`. Scene lengths come from `timings.json`, so the
picture follows the voice.

## The character rig (`src/rig`)

```tsx
<Character look={looks.girl} x={540} y={1380} scale={1.1} walk={1} wave={0} stepRate={1.1} mood="calm" />
```

- Drawn in parts: head, body (torso, breathing), arms (upper/fore/hand), legs (thigh/shin/shoe), cloth, hair, headwear.
- Animations: `walk` (0–1 blend, `stepRate` = walk cycles per second), `wave` (0–1 blend), plus automatic **blink** and **breathe**.
  Give two characters different `blinkOffset`s so they don't blink together.
- `facing={-1}` mirrors the character. Feet sit at (x, y), the figure is ~470 units tall at scale 1.
- **Re-colour / re-dress** by changing the `look` (`src/rig/looks.ts`): skin, hair, `hairStyle`
  (short/long/bun/none), `top`, `bottom`, `accent`, `outfit` (kurta/dress/dhoti/tunic), `headwear`
  (none/crown/turban), `sleeves`, `bindi`, `halo`. Presets: `boy, girl, elder, warrior, deity`.
  New character = `{...looks.boy, top: '#2a9d8f', hair: '#6b3a1f'}`.
- Syncing ground to feet: `walkSpeedPxPerSec(stepRate, scale)` gives the speed to scroll the world at.
- Need a new pose or outfit? Add it to `Character.tsx`/`looks.ts`; don't draw one-off characters inside a story.

## Scene parts (`src/scenery`)

Wrap a scene in `<PaletteProvider palette={palettes.dusk}>` (`dusk`, `night`, `dawn`, `day`), then stack, back to front:

`Sky` (gradient, stars, optional `sun`) → `Moon` → `Clouds` → `HillLayer layer={0}` → `layer={1}` → `layer={2}`
(each takes `scroll` and optional `trees`) → `DiyaTrail` → `Character` → `Sparks` → `Petals`.

Hills scroll at different speeds (0.15 / 0.4 / 1.0 × camera) for parallax; clouds drift at their own speeds.
Layer 2 is the ground: `groundY(screenX, scroll)` returns the hill height so characters stand on it.
Place single `Diya`s or `Tree`s anywhere. Use `src/compositions/RigTest.tsx` as a working example. Each part draws into a full-frame `SvgLayer` (`src/lib/SvgLayer.tsx`), so parts stack in render order.

## Commands

```bash
npm run studio                          # live preview in the browser
npm run storyboard -- RigTest 0 45 89   # stills -> out/storyboard/
npm run render:test                     # 3 s rig-on-hills test -> out/rig-test.mp4
npm run timings -- voice/x.mp3 --out stories/x/timings.json
npm run typecheck
```

Python for timings lives in `~/.venvs/whisper` (Python 3.12, `tools/requirements.txt`; `av` is pinned to 16.x because
newer PyAV breaks faster-whisper 1.2.1).

## Conventions

- Animate from `useCurrentFrame()` only (no `Math.random()`, no CSS animations); use Remotion's `random(seed)` for variety.
- Keep story-specific code in `stories/<slug>/`; shared things go in `src/rig` or `src/scenery`.
- Keep important faces/subjects inside the safe zone; the ground and sky may extend to the edges.
