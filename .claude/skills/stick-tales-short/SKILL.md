---
name: stick-tales-short
description: Make an English "Stick Tales" Short (25-45 s, 1080x1920) - a true story or "why" explainer told with simple stick figures, big hook text and a reveal. Use when the user asks for a Stick Tales reel, a stick-figure story, an English facts/explainer short in the style of @thesticktales3000, or says "use the stick tales skill".
---

# Stick Tales Short (English, stick-figure true stories)

Inspired by @thesticktales3000 (English Shorts: "Why Are School Buses ALWAYS Yellow?", "He Forgot His Wallet and Changed How the World Pays").
**Borrow the pattern, never the content**: no copied topics, scripts, footage, voice, mascot or layout. Our cast is **Sticky** (blue beanie, orange vest).
Series rules live in `channel/series.md` (section 4); topics in `channel/backlog.md` ("Stick Tales").

## Steps (same gates as every reel in this studio)
1. **Pick a topic** from the backlog. Find **2 independent reliable sources** first; no sources, no script. Note them in `stories/<slug>/script.md` under "Sources and fact check".
2. **Create:** `npm run new-story -- <slug> --title "..." --hook "<question>" --language english --style stickTales --series "Stick Tales" --part <n>`
3. **Script (65-110 words, show it and wait for OK):** hook question (0-2 s) -> setup (2 sentences) -> surprise -> real reason -> one-line takeaway -> "Next: ..." teaser. One idea per sentence, short words, spoken English. 6-9 lines, one picture per line, in `script.md` and `voice.txt`.
4. **Voice:** user-recorded or generated English voice into `voice/<slug>.mp3`. Fast, friendly, a beat before the reveal.
5. **Timings:** `npm run timings -- voice/<slug>.mp3 --script stories/<slug>/voice.txt --language en --out stories/<slug>/timings.json`
6. **Scenes** in `story.json` (`language: english`, 4 words at a time). Visual rhythm: a new picture every 2-3 s, big hook text in the first scene, labelled arrows, simple props, maps, pop-in objects.
7. **Storyboard** (`npm run storyboard -- <slug>`), apply notes, then `npm run finish -- <slug> --music music/<track>.mp3`.
8. `npm run youtube -- <slug>`; for this series write the description, hashtags and `captions-en.srt` in **English only**. Upload playlist: *Stick Tales (English)*. Post at 21:30 IST.

## 3D direction (decided 2026-11-16)
New Stick Tales reels use the **3D look**: stick characters in a painted 3D set via `src/toon3d` and `.claude/skills/cartoon-3d-short`. Follow "3D Stick Tales" in `docs/research/STYLE.md` (rhythm checklist, script shapes, cast, sets, palette). For this series the 3D skill's "no captions or labels" rule is overridden: use 1-3 word captions plus pop-in labels. The flat SVG look below is only for quick tests.

## Serialized parts (added 2026-11-17)
For a multi-part run, add a "PART N" header with a gold series line in the first second, a day or step counter, status cards for numbers, and end every part on a cliffhanger title. Details and the two pacing modes (fast list, slow story): "Combined takeaways" in `docs/research/STYLE.md`; sub-style 9 in `docs/research/STYLES-LIBRARY.md`.

## Cinematic mode (added 2026-11-17)
For a 45-65 s "how / why" explainer use the "Cinematic checklist" in `docs/research/STYLE.md` (colour script per scene, extreme close-up plus top-down cutaway, a shot every 1.5-2 s, mid-frame 1-2 word captions, scale-reveal ending). Title pattern: `How <small thing> <big result>` or `Why <thing> <odd behaviour>`.

## Look (flat SVG fallback)
- Flat bright background colour per scene (teal, yellow, sky blue), thin black stick bodies, big round white heads, simple faces, thick caption/hook text in a heavy sans face with one highlighted word.
- Sticky is always `#2F6BFF` beanie + `#FF8A1F` vest. Other characters are one-off stick figures with a name label, never realistic likenesses of real people.
- Stay inside the safe zone (SAFE in `src/lib/theme.ts`); captions via `<Captions>`.

## Rig and style (built)
- `looks.sticky` in `src/rig/looks.ts` is the narrator (`stick: true`): drawn by `src/rig/StickFigure.tsx` (round white head, line limbs, orange vest, blue beanie; idle, walk, wave, blink, breathing). Use `{"look": "sticky"}` in `cast`; one-off extra figures = `{...looks.sticky, top: '...', accent: '...'}` as a full look object. A different `headwear` of `none` drops the beanie.
- Style `stickTales` (`src/styles/index.tsx`): flat teal sky, yellow/orange hills, black ink. Choose it with `--style stickTales`.
- Checked with a storyboard still (idle, walk, wave); not yet used in a full reel. Props, arrows and big hook text come from scenery/overlays; add new ones to `src/scenery` rather than one-off drawings.

## Explainer props (built)
`backdrop: {"palette":"day","bare":true,"clouds":0}` gives a flat teal sky and floor. Put diagrams in `stage` and labels/arrows in `front` (`src/scenery/Stage.tsx`): `panes`, `arrows`, `label`, `fog`, each with `at` (seconds). First used in `stories/airplane-window-hole`. Add new props (map pin, bar, clock, money) to `Stage.tsx` as new item types when a script needs them. Do not use `walk` in `bare` scenes (the floor does not scroll).

## Honest limits
- Only walk and wave poses exist so far (plus idle). Add poses (point, shrug, surprised) to `StickFigure.tsx` when a script needs them.
- Facts must be true: say "is believed to" for beliefs, never invent numbers, quotes or dates.
- No politics, religion jabs, hate, unsafe stunts or sexual content. Answer YouTube's synthetic-content and made-for-kids questions accurately.
