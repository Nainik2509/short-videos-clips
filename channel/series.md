# The three series

One channel, three series. Each has its own look, length and promise, so viewers know what they will get.
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
| Voice | AI voice or your own; short sentences, a pause before the twist |
| Scenes | 4–5 scenes, one picture each: place, object, problem, twist, answer |

Script shape (35–50 words): hook question → what happened (2 sentences) → the twist → one closing line.
The `channel/backlog.md` list is written for this series.

## 2. Kahani: "Dadi ki Kahaniyan" (working title)

| | |
|---|---|
| Promise | A story with one question, told the way a grandmother tells it |
| Length | 40–60 s, 7 beats (question, setting, problem, turn, choice, answer, next) |
| Language | Hinglish or Hindi, calm storyteller |
| Style | One per sub-series: `paperCutout` (friendly), `madhubani` or `warli` (folk), `stainedGlass` (devotional), `shadowPuppet` (night mythology) |
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

## What stays the same across all three

- 1080×1920, 30 fps, captions in the safe zone, 3–4 words at a time (the studio does this).
- Question first, answer last, one line that opens the next one.
- Sound at about -14 LUFS, music under the voice, fading out.
- A consistent upload time and a consistent title pattern (the question).
