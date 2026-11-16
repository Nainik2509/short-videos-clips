# Animated Story Studio

By **Nainik Mehta**. Make vertical (1080×1920, 30 fps) animated reels in **Hinglish, Hindi, English or any other language**:
kahani (mythology, folk tales, moral stories) or any other animated reel. Characters and scenery are SVG drawn in code with
Remotion + TypeScript, so a series always looks the same, and a new reel is mostly a script and a voice-over.

- **How the studio works and its rules:** [CLAUDE.md](CLAUDE.md) (Claude reads this automatically)
- **Step-by-step guide for creators:** [docs/KAHANI-GUIDE.md](docs/KAHANI-GUIDE.md)

## What you get

| | |
|---|---|
| Story engine | `story.json` scenes that follow your voice-over word by word |
| Captions | 3–4 words at a time, spoken word highlighted, always inside the Instagram safe zone |
| Languages | Hinglish, Hindi (Devanagari), English, other Indian languages |
| Character rig | One SVG character that walks, waves, blinks and breathes; re-colour and re-dress it for anyone |
| Scene parts | Sky, stars, sun, moon, 3 hill layers, clouds, trees, diyas, sparks, petals |
| 7 styles | Paper cut-out, shadow puppet, Madhubani, stained glass, Warli, glow line, flat |
| Export | `final.mp4` (H.264, about -14 LUFS), contact sheet to check it, cover image |

## Edit your own footage too

Drop a clip into `raw-footage/` and run `npm run edit -- raw-footage/clip.mp4 --hook "..." --music music/track.mp3`:
dead air is cut, a hook, captions and music are added, and the sound is set to about -14 LUFS. Change anything (bigger hook,
quieter music) by re-running with a flag; the cut and transcript are reused. Pull reference videos you love with
`npm run refs -- <link>` ("inspired by, not a copy"). Guide: [docs/EDIT-YOUR-FOOTAGE.md](docs/EDIT-YOUR-FOOTAGE.md).

## Run a YouTube Shorts channel with it

Three series (Facts, Kahani, Cartoon), a topic backlog, a weekly calendar and upload best practices:
[docs/CHANNEL-PLAYBOOK.md](docs/CHANNEL-PLAYBOOK.md) · [channel/series.md](channel/series.md) · [channel/backlog.md](channel/backlog.md) · [channel/calendar.md](channel/calendar.md).
`npm run youtube -- <slug>` writes the title, description, hashtags and checklist for each upload.

## Requirements

| Tool | Version | Used for |
|---|---|---|
| Node.js | 20+ | Remotion |
| Google Chrome / Chromium | recent | rendering (Remotion downloads its own if needed) |
| ffmpeg | recent | cutting, audio mixing, exports |
| yt-dlp | recent | pulling reference videos (`brew install yt-dlp`) |
| Python | 3.10+ | word timings |

```bash
npm install
python3.12 -m venv ~/.venvs/whisper
~/.venvs/whisper/bin/pip install -r tools/requirements.txt   # faster-whisper for word timings
```

## Make a reel

```bash
npm run new-story -- dadi-ka-diya --title "Dadi ka diya" --hook "Dadi roz sham ko diya kyun jalati thi?" \
    --language hinglish --style paperCutout --series "Dadi ki kahaniyan" --part 1
# write script.md + voice.txt (get the script approved), record voice/dadi-ka-diya.mp3, then:
npm run timings -- voice/dadi-ka-diya.mp3 --script stories/dadi-ka-diya/voice.txt --language hi --out stories/dadi-ka-diya/timings.json
# fill in stories/dadi-ka-diya/story.json, then:
npm run storyboard -- dadi-ka-diya                 # one still per scene -> out/dadi-ka-diya-storyboard.jpg
npm run finish -- dadi-ka-diya --music music/track.mp3   # final.mp4 + qc.jpg + cover.jpg
```

A finished example is included: `sailing-stones` (a 22 s Hindi Facts Short). `npm run studio` previews any story live.

## Commands

| Command | What it does |
|---|---|
| `npm run new-story -- <slug> ...` | Create a story folder from the template and register it |
| `npm run timings -- <voice> --script <voice.txt> --out <timings.json>` | Voice-over → every word with start/end time (captions use your script's words) |
| `npm run storyboard -- <slug>` | One still per scene, tiled into a sheet; the check before any full render |
| `npm run finish -- <slug> [--music file]` | Render, mix voice + music, export final, QC sheet and cover |
| `npm run brand` | Render the channel logo, banner and animated logo sting into `brand/` |
| `npm run youtube -- <slug>` | YouTube title, description, hashtags and pre-publish checklist |
| `npm run edit -- raw-footage/<clip> ...` | Your footage: cut dead air, hook, captions, music, export |
| `npm run refs -- <link>` | Download and analyse reference videos |
| `npm run studio` | Live preview |
| `npm run typecheck` | TypeScript check (also flags unused code) |

## Project layout

```
stories/<slug>/    story.json, script.md, voice.txt, storyboard.md, caption.md, timings.json
stories/registry.ts  stories shown in Remotion      stories/_template/  what new-story copies
voice/ music/ sfx/   audio inputs (git-ignored)     out/  renders and sheets (git-ignored)
raw-footage/ references/ exports/   your clips, reference videos, finished edits (git-ignored)
src/  lib (size, safe zone, languages, captions) · rig (character) · scenery · styles · story (the reel engine)
brand/  logo, banner, animated sting (made by npm run brand)
tools/  new_story.py · timings.py · storyboard.mjs · finish.mjs · edit.mjs · refs.mjs · youtube-pack.mjs · brand.mjs
channel/  series, backlog, calendar        docs/   KAHANI-GUIDE · EDIT-YOUR-FOOTAGE · CHANNEL-PLAYBOOK
```

## Licence

MIT, see `LICENSE` and `THIRD_PARTY_NOTICES.md`.
