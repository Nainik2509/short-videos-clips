# Animated Story Studio

Vertical animated story reels (**1080×1920, 30 fps**) built with Remotion + TypeScript, in
**Hinglish, Hindi, English or any other language**, for kahani (mythology, folk tales, moral stories)
and any other animated reel (facts, explainers, daily series). Characters and scenery are SVG drawn in
code, so every frame is deterministic and every part of a series looks the same.

Two ways to make a reel, same studio:
1. **Animated story** from a script and a voice-over (below).
2. **Edit your own footage**: drop a clip in `raw-footage/`, Claude cuts the dead air, adds a hook, captions and music
   (see "Editing your own footage").

Human guides: [docs/KAHANI-GUIDE.md](docs/KAHANI-GUIDE.md) (stories), [docs/EDIT-YOUR-FOOTAGE.md](docs/EDIT-YOUR-FOOTAGE.md) (footage),
[docs/CHANNEL-PLAYBOOK.md](docs/CHANNEL-PLAYBOOK.md) (the YouTube Shorts channel: setup, best practices, policies).

## The rules (read first)

1. **Script first.** No scenes, no storyboard, no render until `stories/<slug>/script.md` is written
   and the user has approved it.
2. **Storyboard before any full render.** `npm run storyboard -- <slug>` makes one still per scene
   (`out/<slug>-storyboard.jpg`). Look at it, fix the user's notes, then render. `npm run finish`
   refuses to run without an up-to-date storyboard.
3. **Deities are shown with calm, respectful faces.** Always use a look with `sacred: true` (it locks
   the face to a calm, half-lidded, softly closed mouth). Never funny, angry, scared or silly; no jokes
   at their expense; dignified full dress with halo/crown. Narration about them stays reverent.
   Put "Respectful, devotional portrayal: calm faces, traditional clothes and colours, no humour about
   the deity" in mind for every story involving deities.
4. **Captions stay inside the safe zone.** Use `<Captions>` (it sits on the safe-zone floor). `SAFE` in
   `src/lib/theme.ts`: 220 px top, 440 px bottom, 80 px left, 140 px right. Storyboard stills draw the guide.
5. Every video is 1080×1920 @ 30 fps. Never register another video size. The only exceptions are the channel-art *stills* in `src/brand` (LogoMark 800×800, ChannelBanner 2560×1440).
6. **Open with a question.** The first line is a question or a surprise, never a greeting. Answer it
   at the end, then one line that sets up the next part. 45–90 s, calm storyteller voice.
7. **Be faithful and honest.** Follow a well-known retelling; call a folk version a folk version in
   the caption. Do not copy another page's characters, drawings, voice or script. Use music we have the
   rights to. Answer each platform's content-label questions accurately.
8. Never ask for or paste API keys into chat; a voice service key goes in a `.env` file the user edits.

## Languages

`language` in `story.json` picks the caption font and size (`src/lib/languages.ts`):

| language | script | captions | `--language` for timings |
|---|---|---|---|
| `hinglish` | Hindi in English letters | 4 words at a time | `hi` |
| `hindi` | Devanagari | 3 words at a time | `hi` |
| `english` | English | 4 words at a time | `en` |
| `other` | Marathi, Gujarati, Tamil, Bengali... | 3 words at a time | (omit: auto-detect) |

Captions use the **script's own words** (spelled the way the user wrote them) timed by the voice:
`npm run timings -- ... --script stories/<slug>/voice.txt`. Always do this for Hinglish and Hindi.
With one script line per voice.txt line, the tool finds the real pauses in the recording and snaps every line start to its exact moment (scene cuts land on
the first word, verified to within about 2 frames); words inside a line follow the voiced time (about 0.1 s average error). Captions never mix two sentences.
Always write Hindi names the same way (Hanuman, Lakshman, Sanjeevani): keep a spelling list in the story's `script.md`.

## Layout

```
stories/<slug>/    story.json (the reel), script.md, voice.txt, storyboard.md, caption.md, timings.json
stories/registry.ts  every story that shows up in Remotion (npm run new-story edits it)
stories/_template/   what `npm run new-story` copies
voice/ music/ sfx/   audio inputs, named <slug>.mp3 (git-ignored)
out/                 renders, storyboard sheets, finals (git-ignored)
src/
  lib/        theme (size, fps, SAFE), palettes, languages, Captions, SvgLayer
  rig/        Character (SVG, in parts) + looks (colours, outfits, presets)
  scenery/    Sky, Moon, HillLayer(+trees), Clouds, Diya/DiyaTrail, Sparks, Petals, terrain
  styles/     8 style presets (flat, paperCutout, shadowPuppet, madhubani, stainedGlass, warli, glowLine, stickTales)
  story/      StoryReel (the generic reel), timeline (scenes follow the voice), types, entry (validation)
  edit/       EditReel (your own footage + hook, captions, music)
  brand/      ClayMark (soft-3D storybook + spark mark, aurora background, clay lighting filters), BrandComps (LogoStill = composition `LogoMark`, LogoSting 4 s animated logo, ChannelBanner)
tools/        new_story.py, timings.py, storyboard.mjs, finish.mjs
docs/         KAHANI-GUIDE.md, EDIT-YOUR-FOOTAGE.md, CHANNEL-PLAYBOOK.md
brand/        logo-icon.png (profile picture), channel-banner.png, logo-sting.mp4 (animated logo), made by `npm run brand`
channel/      series.md (Facts, Kahani, Cartoon), backlog.md (topics + status), calendar.md (weekly rhythm, first 30 days)
raw-footage/  your original clips (never modified or deleted by Claude; git-ignored)
references/   downloaded reference videos + STYLE.md (git-ignored)
exports/      finished edits: <name>-final.mp4, -qc.jpg (git-ignored)
work/<name>/  edit.json (settings), cut.mp4, timings.json for an edit (git-ignored)
.claude/skills/  cartoon-3d-short (three.js style; not set up in this repo yet), stick-tales-short (English stick-figure Shorts)
```

## How a reel is made (always in this order)

1. **Pick the story + one style.** Question first line. One style per series (see `src/styles`).
2. **Create the folder:**
   `npm run new-story -- <slug> --title "..." --hook "<the question>" --language hinglish --style paperCutout --series "..." --part 1`
3. **Script, in 7 beats**: question (0–3 s), setting (3–8), problem (8–15), turn (15–25), choice (25–35),
   answer (35–42), next (last 3 s). Write it into `script.md` and the spoken lines into `voice.txt` (one scene's line per line).
   Show the user the script + scene list and **wait for OK**.
4. **Voice**: the user records `voice/<slug>.mp3` (own voice, a generated voice with emotion tags, or none: then music and big captions only).
5. **Timings**: `npm run timings -- voice/<slug>.mp3 --script stories/<slug>/voice.txt --language hi --out stories/<slug>/timings.json`
6. **Scenes**: fill `story.json` (see below). Each scene's `line` must equal its line in `voice.txt`; the scene starts on that line's first word.
7. **Storyboard**: `npm run storyboard -- <slug>`; show `out/<slug>-storyboard.jpg`; apply the user's notes; repeat.
8. **Finish** (only after the storyboard is approved):
   `npm run finish -- <slug> [--music music/track.mp3]` → `out/<slug>-final.mp4` (H.264 ~16 Mbps, AAC, about -14 LUFS, peaks under -1 dB),
   `out/<slug>-qc.jpg` (contact sheet, a frame every 2.5 s), `out/<slug>-cover.jpg` (the question over the hero frame).
9. Write `caption.md`: the question as line 1, 2 lines of story, series name + part, 3–5 hashtags. Check the QC sheet.
10. **Series**: same name, same style, same characters; the part number in the first second; last line opens the next part.

Live preview of any story: `npm run studio`.

## story.json

```json
{
  "slug": "dadi-ka-diya", "title": "...", "hook": "Dadi roz sham ko diya kyun jalati thi?",
  "language": "hinglish", "style": "paperCutout", "series": "Dadi ki kahaniyan", "part": 1, "heroScene": 2,
  "scenes": [
    {"id": "question", "line": "Dadi roz sham ko diya kyun jalati thi?", "duration": 4,
     "backdrop": {"palette": "dusk", "moon": {"x": 800, "y": 520, "r": 80, "phase": 0.35}},
     "cast": [{"look": "elder", "x": 380, "action": "idle", "mood": "smile"},
              {"look": "boy", "x": 690, "facing": -1}]}
  ]
}
```

- **backdrop**: `palette` (dusk/night/dawn/day/playaNight/playaDawn), `sun`, `moon`, `clouds`, `trees` `[back, middle, front]`, `diyas`, `sparks`, `petals`,
  `rocks` (`x`, `toX`, `size`, `trailFrom`, `gps`: a rock that slides and leaves a trail), `ice` (floating ice panels, `x`, `toX`), `scrollSpeed`, `offset`. A walking character sets the ground speed automatically so feet do not slide.
- **explainer props** (Stick Tales): `backdrop.bare: true` = flat sky and floor, no hills; per scene `stage` (behind characters) and `front` (in front) hold items from `src/scenery/Stage.tsx`: `panes` (airplane-window cross-section: `hole`, `highlight`, `crack`, `sides`), `arrows` (`angle`, `count`), `label` (`text`, `size`, `color`), `fog` (`clearOver`); each has `at` = seconds into the scene to pop in. Keep labels at x 540 or inside x 160–920 and y ≥ 560 (below the opening hook).
- **cast**: `look` (preset name or a full look object), `x`, `toX` (moves during the scene), `scale`, `facing` (1 or -1),
  `action` (idle / walk / wave / walkWave), `mood` (calm / smile), `blinkOffset`.
- **scene**: `id`, `line`, `start` (seconds; overrides `line`), `duration` (only used before timings exist), `push` (end zoom, default 1.05).
- Good scenes have: depth (3 hill layers), life (blink/breathe), one light source, particles, a slow camera push, one hero moment.
- Validation errors name the file and the field; fix and re-run.

## The character rig (`src/rig`)

`<Character look x y scale facing walk wave stepRate mood blinkOffset />`: head, body (breathing), arms, legs, cloth, hair, headwear;
walk / wave blends plus automatic blink and breathing. New character = `{...looks.boy, top: '#2a9d8f'}` (fields: skin, hair, `hairStyle`,
top, bottom, accent, `outfit` kurta/dress/dhoti/tunic, `headwear` none/crown/turban, `sleeves`, `bindi`, `halo`, `sacred`).
Presets: boy, girl, elder, warrior, deity, sticky (Stick Tales stick figure, `stick: true`, drawn by `src/rig/StickFigure.tsx`). Need a new pose or outfit? Add it to the rig; never draw one-off characters in a story.
Styles recolour looks automatically (e.g. Warli turns everyone off-white), so keep looks in `story.json` style-free.

## Editing your own footage

The 5 tools: **Remotion** (`src/edit/EditReel.tsx`, builds video and graphics from code), **Hyperframes** (HeyGen's HTML-to-video
tool, installed: `npx hyperframes`; use it when a graphic is easier as HTML/CSS), **FFmpeg** (cuts and exports), **Whisper**
(`tools/timings.py`, captions), **yt-dlp** (`npm run refs`, pulls reference videos).

1. **Learn the style.** The user gives 3–5 links of videos they love: `npm run refs -- <link> <link> ...` downloads each into
   `references/<id>/` with a contact sheet (`frames.jpg`) and a transcript. Look at them, fill in `references/STYLE.md`, then write the
   resulting style (hook type, pacing, caption look, music mood) into this file under "My edit style". **Inspired by, not a copy:**
   borrow patterns only, never another creator's script, footage, characters, voice or layout.
2. **Film and drop the file** into `raw-footage/`. Never edit, move or delete originals there.
3. **Edit:** `npm run edit -- raw-footage/<clip>.mp4 --hook "<first-line hook>" --language hi|en|hinglish --music music/<track>.mp3`
   cuts the dead air (silences over 0.5 s, with a 0.12 s breath kept), transcribes the cut, renders hook + captions + ducking music,
   masters sound to about -14 LUFS (peaks under -1.5 dBFS), and writes `exports/<name>-final.mp4` and `exports/<name>-qc.jpg`.
4. **Review and fix.** Show the user the QC sheet/video. Notes become settings in `work/<name>/edit.json` (or flags), then run the
   same command again: the cut and transcript are reused, only the render repeats (about 10 s).
   "Make the hook bigger" → `--hook-size 120`. "Captions too big" → `--caption-size 56`. "Music too loud" → `--music-volume 0.1`.
   "Cuts feel too tight" → `--min-silence 0.8`. "No captions" → `--no-captions`. Changed the cut settings or footage? Add `--force`.
   Hinglish footage: Whisper writes Hindi speech in Devanagari; for Roman captions pass `--script` with the exact words.
5. Same safe-zone rule as stories: captions and hook stay inside the safe zone. Ask the user to watch it once on their phone.

### My edit style
_Not set yet. Add the 3–5 reference links, run `npm run refs`, and fill in `references/STYLE.md`; then summarise it here._

## The YouTube Shorts channel (four series)

The new channel runs **Facts** (Hindi, 15–25 s), **Kahani** (Hinglish/Hindi, 40–60 s), **Cartoon** (recurring cast, 20–40 s) and **Stick Tales** (English, stick-figure true stories and "why" explainers, 25–45 s, inspired by the channel @thesticktales3000: pattern only, never its topics, scripts, footage or mascot).
For a Stick Tales reel follow `.claude/skills/stick-tales-short/SKILL.md` and the series rules in `channel/series.md`.
Read `channel/series.md` before making any reel: each series has its own length, style and rules; keep one look per series.
Pick topics from `channel/backlog.md` and update their status. Follow `docs/CHANNEL-PLAYBOOK.md`.

- **Facts must be true.** Put 2 reliable, independent sources in the story's `script.md` ("Sources and fact check") before scripting.
  Never invent history or science; say "माना जाता है" for beliefs. If sources cannot be found, do not script it; pick another topic.
- **When the user picks a facts topic and asks only for the script**: output only the clean Hindi (Devanagari) narration, 35–50 words,
  starting with a curiosity hook, a reveal or twist, simple conversational Hindi, one idea per sentence. No headings, scene notes or commentary.
  When asked for 20 topics, give 20 new, verifiable, Hindi (Devanagari) topics each with one curiosity line; never repeat earlier ones.
- **Original, never mass-produced.** Every reel gets its own script, voice, scenes and hook. Do not reuse a structure with only words swapped.
  Do not copy another channel's topics, scripts or footage.
- After `npm run finish`, run `npm run youtube -- <slug>` to write `stories/<slug>/youtube.md` (title, description, hashtags, playlist,
  pinned comment, checklist). Fill its placeholders (story lines, sources, music credit).
- **Never create the channel, post, upload or comment for the user** unless they ask for that exact action in this chat; the channel is theirs
  (their Google account). Prepare everything, then hand over.
- Answer each platform's content questions accurately (altered/synthetic content, made for kids); decide "made for kids" with the user. Public descriptions are about the story, its sources and the music.
- **Stick Tales is English only** (English description, one `captions-en.srt`, `language: english`). **Every other series is bilingual: English first, then the story's language** (channel About text, video descriptions, transcript, pinned comment), because the channel is for a global audience. Titles stay in the story's language; add an English line at the top of the description. Upload two subtitle tracks per video: the story's language (`captions-<lang>.srt`) and English (`captions-en.srt`), with the same cue timings.

### Channel branding
Channel: **Doodle Story Tales**, `@DoodleStoryTalesOfficial`. The brand is code: the mark, banner (with Pinku, Gudiya and Dadi from the rig) and the animated
sting are in `src/brand`; the look is soft-3D "clay" (SVG lighting filters), aurora mesh gradient, glass pills and extruded lettering; change a colour or a character there and run `npm run brand`. Palette: Midnight Ink `#17124A`, Saffron `#FF8A1F`,
Marigold `#FFC93C`, Teal `#2EC4B6`, Paper `#FFF4DE`; wordmark in a rounded bold face. Use `brand/logo-sting.mp4` (1080×1920, 4 s) at the start or end of
a Short if wanted. Banner name and tagline stay inside YouTube's central safe area (about 1546×423 of 2560×1440).
Channel texts, keywords, playlists and Studio settings (English · हिन्दी · Hinglish, global reach) live in `channel/settings.md`.

## Fixing problems

| Problem | Do |
|---|---|
| Character looks wrong | Ask for 2 reference images, adjust `looks`/the rig |
| Scenes look different | One rig, one palette, one style for the whole series |
| Scene feels flat | 3 hill layers, a light source (moon/diya/sun), particles (sparks/petals) |
| Characters float or slide | Feet follow `groundY`; walking scenes auto-match scroll speed. Do not set `scrollSpeed` on walking scenes |
| Captions out of sync | Re-run timings with `--model medium` and `--script` |
| Hindi words spelled wrong | Fix `voice.txt` (captions use it) and re-run timings |
| Render fails | Paste the last 20 lines; try `npm run storyboard` first (renders single frames) |
| Render slow | Close other apps; storyboard stills first, full render last |

## Commands

```bash
npm run new-story -- <slug> --title "..." --hook "..." --language hinglish --style paperCutout
npm run timings -- voice/<slug>.mp3 --script stories/<slug>/voice.txt --language hi --out stories/<slug>/timings.json
npm run storyboard -- <slug>                    # one still per scene -> out/<slug>-storyboard.jpg
npm run storyboard -- <CompositionId> 0 45 89   # stills of chosen frames of any composition
npm run finish -- <slug> [--music music/x.mp3]  # render + mix + final.mp4 + qc.jpg + cover.jpg
npm run edit -- raw-footage/<clip>.mp4 --hook "..."   # cut dead air + hook + captions + music -> exports/
npm run refs -- <link-or-file> ...              # download/analyse reference videos into references/
npm run youtube -- <slug>                       # YouTube title, description, hashtags, checklist -> stories/<slug>/youtube.md
npm run brand [-- logo|banner|sting|watermark]  # re-render brand/: profile picture, banner, animated logo sting, 300x300 video watermark
npm run studio                                  # live preview
npm run typecheck
```

Python for timings lives in `~/.venvs/whisper` (Python 3.12, `tools/requirements.txt`; `av` is pinned to 16.x because newer
PyAV breaks faster-whisper 1.2.1). Whisper models: `tiny/base/small` (default)/`medium`; bigger is slower and more exact.

## Conventions

- Animate from `useCurrentFrame()` only (no `Math.random()`, no CSS animations); use Remotion's `random(seed)` for variety.
- Story-specific data lives in `stories/<slug>/`; shared things go in `src/rig`, `src/scenery`, `src/styles`.
- A new style is one entry in `src/styles/index.tsx` (palette, look mapper, overlay, drawings per second). Presets now include `stickTales` (English series).
- Keep important faces and subjects inside the safe zone; the ground and sky may extend to the edges.
- `npm run typecheck` must pass (it also flags unused code).
