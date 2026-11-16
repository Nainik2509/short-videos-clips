# Animated kahani reels: step-by-step guide

How to make a vertical animated reel in **Hinglish, Hindi, English or another language**: one line to Claude in,
a finished video out. Adapted from the "Animated kahani reels with Claude" guide. Everything is drawn in code.

Setup (steps 1–3) is **already done** on this computer: Claude Code, Node, ffmpeg, Python + faster-whisper,
Chrome, and this studio folder. Open Claude Code **inside this folder** so it reads `CLAUDE.md`.

## What works well (what the guide found)

| Part | What to do |
|---|---|
| First line | A question or a surprise, never a greeting. The answer comes at the end |
| Length | 45–90 seconds |
| Look | One style per series: people should recognise the page before reading the name |
| Voice | Calm, slow storyteller. Short sentences. A pause before the twist |
| Captions | Big, 3–4 words at a time, spoken word highlighted |
| Ending | The answer, then one line that pulls to the next part |

## Daily workflow

1. **Pick a story with a question.** Ideas below, or ask Claude for 10 more.
2. **Pick one style** (table below) and keep it for the whole series.
3. **Tell Claude, in one line:**
   > New reel: "Hanuman ji aur Sanjeevani", paper cut-out style, Hinglish, 45 seconds. Same rules as always.

   Claude creates the story folder (`npm run new-story`), writes the **script in 7 beats** and the scene list, and **waits for your OK**.
4. **Voice.** Record `voice/<slug>.mp3` on your phone in a quiet room (say each line twice, keep the better take), or use a generated voice
   (ask Claude to rewrite the script with tags like `[softly]` and `[pause]`), or no voice at all (music and big captions only).
   Never paste an API key into the chat: put it in a `.env` file yourself.
5. **Timings.** Tell Claude: "here is my voice-over, make the word timings and cut the scenes to it". Claude runs
   `npm run timings -- voice/<slug>.mp3 --script stories/<slug>/voice.txt --language hi ...`. Captions use your script's spelling.
6. **Storyboard.** Claude renders `out/<slug>-storyboard.jpg`: one still per scene. Check it, then send **all your notes in one
   message** ("Hanuman ji is too small", "faces calm, not funny", "scene 3 is too slow"), then say "render it".
7. **Finish.** Claude runs `npm run finish -- <slug>` and gives you `out/<slug>-final.mp4`, `out/<slug>-qc.jpg` and `out/<slug>-cover.jpg`.
   Add music with `--music music/your-track.mp3` (about 8 dB under the voice, ducks while the voice speaks, fades out in the last second).
8. **Before you post:** watch it once on your phone with sound and without; the question is on screen in the first second; names and places
   are spelled right; content-label questions are answered accurately. Ask Claude to write `caption.md` (question first, 2 lines of story, series + part, 3–5 hashtags).
9. **Series:** same name, same look, same opening ("Part 4"), same posting time, an open ending, pin part 1.

## The 7 beats of the script

| Beat | Seconds | What it does | Example |
|---|---|---|---|
| 1 Question | 0–3 | The hook. One line, no greeting | "Lakshman 14 saal soye kyun nahi?" |
| 2 Setting | 3–8 | Who, where, when. One picture | "Vanvaas ki pehli raat. Ram ji aur Sita Maa so rahe the." |
| 3 Problem | 8–15 | What is at stake | "Lakshman ne faisla kiya: main pehra dunga. Har raat." |
| 4 Turn | 15–25 | The surprise or the visitor | "Tabhi Nidra Devi aayi..." |
| 5 Choice | 25–35 | What the hero decides | "Lakshman ne apni neend kisi aur ko de di." |
| 6 Answer | 35–42 | The answer to the question | "Ayodhya mein Urmila 14 saal soti rahi." |
| 7 Next | last 3 | One line that pulls to the next part | "Par jab Lakshman laute... kal batunga." |

Write the way a storyteller speaks: one idea per sentence, present tense feels closer ("Hanuman ji udte hain"), read it aloud once; if you run out of breath the sentence is too long.

## Languages

| In `story.json` | You write | Caption look |
|---|---|---|
| `"language": "hinglish"` | Hindi in English letters | Roman font, 4 words |
| `"language": "hindi"` | Devanagari | Devanagari font, 3 words |
| `"language": "english"` | English | Roman font, 4 words |
| `"language": "other"` | Marathi, Gujarati, Tamil, Bengali... | Indic font stack, 3 words |

For Hindi names, tell Claude once: "always write Hanuman, Lakshman, Sanjeevani like this". This studio takes captions from `voice.txt`,
so spelling is always yours. Other reels (facts, explainers, moral stories, any topic) use the same steps: same folder, same commands.

## Styles (pick one per series)

| Style | Look | Good for |
|---|---|---|
| `paperCutout` | Layered paper, soft shadows, light grain, 12 drawings/s | Mythology, friendly stories |
| `shadowPuppet` | Amber lamp-lit cloth screen, dark outlines, 10 drawings/s | Night scenes, mythology |
| `madhubani` | Bihar folk painting: black outlines, flat colours, patterned border | Folk tales |
| `stainedGlass` | Temple window: arch, gold trim, lead lines, sweeping sunlight | Devotional, premium |
| `warli` | Off-white figures on terracotta, triangle borders | Folk tales, tribal art |
| `glowLine` | Glowing outlines on black | Dramatic, modern |
| `flat` | Clean colours, bold outlines (the default) | Anything |

A style of your own: drag 2–3 images you like into the chat and say "add a style for this look" (one entry in `src/styles/index.tsx`).
The styles are close approximations of each tradition; tell Claude what to refine ("thicker outlines", "more red").

## Story ideas (each with a first line that works)

| Story | First line (the question) |
|---|---|
| Lakshman ji ki neend | Lakshman 14 saal soye kyun nahi? |
| Hanuman ji aur Sanjeevani | Hanuman ji ne poora parvat kyun utha liya? |
| Shabari ke ber | Ram ji ne jhoothe ber kyun khaaye? |
| Hanuman ji aur suraj | Bachpan mein Hanuman ji ne suraj ko kyun pakda? |
| Kumbhakaran ki neend | Kumbhakaran 6 mahine kyun sota tha? |
| Ganesh ji aur Mahabharat | Mahabharat likhte waqt Ganesh ji ne kya shart rakhi? |
| Ekalavya | Ekalavya ne angootha kyun diya? |
| Karna ka sach | Karna ko apni maa ka naam kab pata chala? |
| Bhishma ki pratigya | Bhishma ne kabhi shaadi kyun nahi ki? |
| Bandar aur magarmach (Panchatantra) | Bandar ne kaha "mera dil ped par hai". Kyun? |
| Sher aur khargosh (Panchatantra) | Ek chhote khargosh ne sher ko kaise haraya? |
| Birbal ki khichdi | Khichdi itni door se kaise pakti? |
| Raja Harishchandra | Ek raja ne sach ke liye sab kuch kyun diya? |
| Dadi ki kahani | [your dadi's first line, as a question] |
| Apne shehar ki kahani | [your city's name] ka naam kyun pada? |

For deities, follow a well-known retelling and keep the facts right. If it is a folk version, say so in the caption ("jaise dadi sunati thi").

## 10-day series you can copy

Ramayan ki 30 kahaniyan: Day 1 Lakshman 14 saal soye kyun nahi? · 2 Urmila ne kya kiya? · 3 Shabari ke ber · 4 Hanuman ji ki pehli udaan ·
5 Setu kaise bana? · 6 Vibhishan ne Lanka kyun chhodi? · 7 Sanjeevani parvat · 8 Kumbhakaran ki neend · 9 Ravan ka antim sach · 10 Ayodhya wapsi: Diwali kyun?
Ask: "Plan a 10-part series called [NAME] in [STYLE] style. For each part: the first-line question, the story in 2 lines, and the last line that sets up the next part. Then make part 1."

## Respect (this is not optional)

- Keep the facts right; call a folk version a folk version.
- **Calm, kind faces for deities.** No funny distortions, no jokes at their expense. The deity look in this studio locks the face to a calm expression.
- Do not copy other pages: the epics belong to everyone, but another creator's characters, drawings, voice and script are theirs. Make your own look.
- Use music you have the rights to, or Instagram's own music library.
- Answer each platform's content-label questions accurately. Read the comments; if someone points out a mistake, thank them and fix it in the next part.

## If something goes wrong

| Problem | What to say to Claude |
|---|---|
| Character looks wrong or childish | "Here are 2 reference images. Redraw the rig closer to this: proportions, crown, clothes." |
| Every scene looks different | "Use one rig and one palette for every scene, saved in the project." |
| Scene feels flat | "Add 3 parallax layers, a light source and particles." |
| Characters float or slide | "Put their feet on the ground line and match the walk speed to the ground." |
| Captions out of sync | "Redo the word timings with the larger whisper model." |
| Hindi words spelled wrong | "Always write Hanuman, Lakshman, Sanjeevani like this." |
| Render fails with a long error | Paste the last 20 lines into the chat |
| Render is very slow | "Render a 10-second test first." Close other apps |
| Audio too quiet or too loud | "Normalise to -14 LUFS." |
| Claude forgot my style | Open Claude Code inside this folder, then "read CLAUDE.md again" |
| Usage limit hit | Wait for the reset; work in stills first, full renders only at the end |

If a reel gets messy: start a new chat in this folder and say "start this story again from the approved script". The script, rig and style are saved.

## FAQ

- **Free?** The tools are free (Remotion is free for individuals and small teams up to 3 people; a bigger company needs a licence). Claude Code needs a paid Claude plan. Voice services have free tiers with limits.
- **Drawing or coding needed?** No. You choose the story and judge the result.
- **Mac or Windows?** Both. Not a phone: make it on a computer, post from your phone.
- **How long is one reel?** First one 1–2 hours with setup; after that about 30–60 minutes, mostly rendering.
- **My own images or clips?** Yes: put them in the story folder and ask Claude to use them. Code keeps a whole series looking the same.
- **YouTube videos?** Same steps, set it to 1920×1080 and add chapters (a different composition size; ask Claude to add it).
