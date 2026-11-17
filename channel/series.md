# The four series

One channel, four series (Facts, Kahani and Cartoon in Hindi/Hinglish, plus **Stick Tales** in English). Each has its own look, length and promise, so viewers know what they will get.
Keep them in separate **playlists** and give each its own **opening pattern**.

## 1. Facts: "Ajeeb Sach" (working title)

| | |
|---|---|
| Promise | A real, surprising fact you did not know, told as a 20-second mystery |
| Length | 15–25 s (35–50 Hindi words) |
| Language | Hindi (Devanagari), calm fast narrator |
| Style | `flat` for history and science, `glowLine` for dark mysteries |
| Hook | A "Why?/How?/What happened?" question, then the reveal in the last 5 s |
| Rules | 2 reliable sources per topic written in `script.md`; say "माना जाता है" for beliefs; never invent. No people shown unrealistically: use the generic cast |
| Voice | Recorded or generated voice; short sentences, a pause before the twist |
| Scenes | 4–5 scenes, one picture each: place, object, problem, twist, answer |

Script shape (35–50 words): hook question → what happened (2 sentences) → the twist → one closing line.
The `channel/backlog.md` list is written for this series.

## 2. Kahani: "Dadi ki Kahaniyan" (working title)

| | |
|---|---|
| Promise | A story with one question, told the way a grandmother tells it |
| Length | 40–60 s, 7 beats (question, setting, problem, turn, choice, answer, next) |
| Language | Hinglish or Hindi, calm storyteller |
| Style | One per sub-series: `paperCutout` (friendly, devotional), `madhubani` (folk), `glowLine` (night mythology) |
| Rules | Well-known retelling; folk versions labelled; **deities always calm and respectful** (`sacred` looks); end with the next part |
| Numbering | Always "Part N" in the first second (the studio adds it from `series` + `part`) |

Sub-series ideas: *Ramayan ki 30 kahaniyan*, *Mahabharat ke sach*, *Panchatantra*, *Dadi ke nuskhe*, *Birbal ki chaturai*.

## 3. Cartoon: "Pinku aur Dadi" (working title)

| | |
|---|---|
| Promise | Two minutes of warm, funny or wise moments with the same small cast |
| Length | 20–40 s |
| Language | Hinglish (Roman captions) or Hindi |
| Style | `flat` or `paperCutout`; the same style for the whole series |
| Cast | Fixed looks, never changed between episodes (below) |
| Rules | Original characters and stories only; gentle humour; no deities in comic scenes; a small lesson or a laugh in the last line |

Recurring cast (store these in each story as full look objects or reuse the presets):

| Character | Look | Personality |
|---|---|---|
| **Pinku** | `looks.boy` | curious, asks "kyun?", slightly mischievous |
| **Dadi** | `looks.elder` | calm, funny, answers with a story |
| **Gudiya** | `looks.girl` | clever, solves the problem |
| **Chacha** | `looks.warrior` with `headwear: 'none'`, `top` teal | the grumpy neighbour who comes around |

Keep each character's colours fixed. A new character = `{...looks.boy, top: '...'}` saved once and reused.

## 4. Stick Tales (English, stick-figure explainers and true stories)

Inspired by the channel @thesticktales3000 (checked 2026-11-16: English Shorts, ~1.6k subscribers, 23 videos, titles like
"Why Are School Buses ALWAYS Yellow?", "He Forgot His Wallet and Changed How the World Pays", "The Town That Paid Silence as Tax").
**Pattern only, never their topics, scripts, footage, character or layout.** Our version has its own cast, palette and topics.
Live numbers (2026-11-17): 1.67k subs, one Short at 1.16M views, the rest 1.4k to 94k. A serialized channel, @BeanieSurvives (about 112k subs in 2 months, part-numbered story with a day counter and cliffhangers), shows the better way to build followers: for Kahani and Cartoon runs use "Part N", a day counter and a next-part hook. See `docs/research/STYLE.md`.

| | |
|---|---|
| Promise | One surprising true story or "why" answered in 25–45 s by a simple stick-figure narrator, in English |
| Length | 25–45 s (65–110 spoken words), fast, one idea per sentence |
| Language | **English only** (`language: english`, `--language en`); public text is English only for this series |
| Style | Flat bright colour, thin black stick bodies, round white heads, big bold hook text. Preset `stickTales` and the `looks.sticky` stick figure (`src/rig/StickFigure.tsx`); see `.claude/skills/stick-tales-short/SKILL.md` |
| Hook | A "Why/How/What happened" question or a one-line shock in the first 2 s, shown as big on-screen text AND spoken |
| Cast | **Sticky** (blue beanie, orange vest: narrator and the everyday person), plus one-off stick figures per story. Keep Sticky's colours fixed (blue `#2F6BFF`, orange `#FF8A1F`), never copy another channel's mascot |
| Topics | Everyday "why" (colour of things, rules, money), business and invention origins, odd history, "what if" science. India-and-world mix |
| Rules | 2 reliable sources per script ("Sources and fact check"); no invented numbers; beliefs labelled; no real person shown realistically (stick figures plus name text only); no politics or religion jabs, no hate, no unsafe stunts, nothing sexual |
| Visual rhythm | A new picture every 2–3 s (zoom, pop-in, labelled arrows, maps, simple props), captions 4 words at a time in the safe zone |
| Last line | The answer, then a line that opens the next one ("Next: why ...") |
| Music | Light, upbeat, quiet under the voice, rights-cleared only |

Script shape (65–110 words): hook question → the setup (2 sentences) → the surprise → the real reason → one-line takeaway → next teaser.
A Stick Tales Short is a *story with a reveal*, not a list of facts: keep one person, thing or place at the centre.

## What stays the same across all four

- 1080×1920, 30 fps, captions in the safe zone, 3–4 words at a time (the studio does this).
- Question first, answer last, one line that opens the next one.
- Sound at about -14 LUFS, music under the voice, fading out.
- A consistent upload time and a consistent title pattern (the question).
