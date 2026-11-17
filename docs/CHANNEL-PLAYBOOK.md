# New YouTube Shorts channel: playbook and best practices

A second channel, separate from your existing one, for four kinds of animated Shorts made in this studio:

| Series | What it is | Made with |
|---|---|---|
| **Facts** (Hindi mystery and unusual facts) | 15–25 s curiosity stories: strange history, inventions, science, real incidents | `story.json` + voice-over (style `flat` or `glowLine`) |
| **Kahani** (mythology, folk tales, moral stories) | 45–60 s animated stories, Hinglish or Hindi, one question per reel | `story.json` + voice-over (style `paperCutout`, `madhubani`, ...) |
| **Cartoon** (recurring characters, short comic and moral reels) | 20–40 s episodes with a fixed cast | `story.json` + rig characters |
| **Stick Tales** (English stick-figure true stories and "why" explainers) | 25–45 s, English only, own cast (Sticky) | `story.json` (`language: english`); see `.claude/skills/stick-tales-short` |

Details of each series: [channel/series.md](../channel/series.md). Topics ready to go: [channel/backlog.md](../channel/backlog.md).
Weekly rhythm and the first 30 days: [channel/calendar.md](../channel/calendar.md).

**What I can and cannot do:** this studio prepares everything (scripts, videos, titles, descriptions, hashtags). Creating the
channel, choosing the handle, uploading and answering YouTube's questions are done by you in your own Google account.

## The channel (created 2026-11-16)

**Doodle Story Tales** · handle `@DoodleStoryTalesOfficial` · https://www.youtube.com/@DoodleStoryTalesOfficial
A Brand Account channel, separate from the existing SlayArcade channel.
**Done:** profile picture and banner (`brand/`, made with `npm run brand`; re-made 2026-11-16 with the whole cast and the three language chips), about text, upload defaults (Private, description footer), and the three playlists
(*Ajeeb Sach (Facts)*, *Dadi ki Kahaniyan (Kahani)*, *Pinku aur Dadi (Cartoon)*).
**To add (yours, in YouTube Studio):** a fourth playlist **Stick Tales (English)**, an English-first line in the channel About text ("New: English Stick Tales, true stories and why-questions in 40 seconds"), and set each Stick Tales upload's video language to English. Stick Tales Shorts have English-only descriptions and a single `captions-en.srt`; the "English first, then story language" rule only matters for the Hindi series.
**Global-reach pack (2026-11-16):** new About text, keywords, language lanes, playlist names, per-video recipe and Studio settings are in [channel/settings.md](../channel/settings.md); applied in Studio on 2026-11-16 (banner, picture, About text, four playlists, keywords, country, upload defaults).
**Still yours:** contact email, links, the made-for-kids decision, and two-step verification on the Google account.

## 1. Set up the channel (about 30 minutes, you do this)

- [x] Create a **new Brand Account channel** (done: Doodle Story Tales).
- [ ] **Name and handle.** Short, easy to say aloud, works in Hindi and English, not tied to one series. Check the handle is free and no one has a near-identical name.
      Ideas to test (availability not checked): *Kahani Kitab*, *Rahasya Rang*, *Kyun Kaise Kahani*, *Chhota Rahasya*, *Pinku ki Duniya*, *Dadi Dost*.
- [x] **Profile picture and banner** (done: storybook + spark mark; banner with the cast, `Stories · Facts · Cartoons · Daily` and English / हिन्दी / Hinglish chips).
- [ ] **About:** paste the text from `channel/settings.md` (English first, then हिन्दी and Hinglish), plus business email and keywords.
- [x] Default upload visibility **Private** (done). [ ] Country India and default language Hindi (Studio → Settings → Channel / Upload defaults → Advanced).
- [ ] **Audience setting (made for kids):** decide honestly per video. Cartoons are not automatically "made for kids". A general-audience family kahani is usually
      "not made for kids"; content directed at children must be marked, which limits comments and some features. Read YouTube's current guidance and be consistent.
- [x] **Series playlists** created (Facts, Kahani, Cartoon). Add one per long series later (e.g. "Ramayan ki kahaniyan").
- [ ] Turn on **two-step verification** on the Google account. Never share the password; add helpers as channel managers instead.

## 2. Positioning that makes people subscribe

- One promise per series, same look every time (that is what the studio's style presets are for), same opening line pattern, same posting time.
- Open every Short with a **question or surprise in the first 1–2 seconds**. No greeting, no logo, no intro.
- Answer at the end, then one line that makes them want the next one.
- Pin one **Part 1 / best-of** playlist so new viewers start in the right place.
- Say a clear next step in the pinned comment ("Kal: ...") instead of "subscribe".

## 3. How Shorts are judged (what to optimise)

- Watch **YouTube Studio → Analytics → Engagement → "Viewed vs swiped away"** for each Short. If many swipe away in the first seconds, the **hook** is the problem.
- **Average percentage viewed** (above 100% means people loop it): aim for tight scripts. 15–25 s facts and 40–55 s stories are easier to finish than 90 s.
- Check **retention graph** dips: a scene that loses people should be cut or sped up in the next one.
- Judge a series after **10–15 uploads**, not 2. Keep the format that works, change one thing at a time (hook style, length, voice, style preset).
- Do not chase length: Shorts can be up to 3 minutes now, but retention matters more than minutes.

## 4. Upload best practices

- **Format:** vertical 1080×1920, 30 fps (this studio's default). Keep faces and key action inside the safe zone.
- **Title:** the question itself, in the language of the audience, up to ~70 characters so it is not cut off. Example: "लक्ष्मण 14 साल सोए क्यों नहीं?". No clickbait the video does not deliver.
- **Title patterns that scale** (seen on a 191k-sub explainer channel, studied 2026-11-17, see `docs/research/STYLE.md`): `Why <thing> <odd behaviour>`, `How <small thing> <big result>`, `The <noun> That <odd verb>`. 4 to 8 words, one idea, no emoji spam, promise a *mechanism or consequence* the video shows. Hold one length band and one look so viewers know what they get.
- **Description (English + Hindi):** line 1 = the question in English and Hindi; 2 lines of story; series name + part; source line for facts; music credit.
- **Hashtags:** 3–5, relevant. YouTube shows the first three above the title and ignores a post that uses more than 15. `#Shorts` is optional.
- **Playlist:** add every Short to its series playlist at upload.
- **Pinned comment:** a question to the audience or the teaser for the next part.
- **Captions:** burned in by the studio (3–4 words, spoken word highlighted). Also set the **video language** in upload settings.
- **Schedule** with YouTube's scheduler at the same time daily so the audience learns when to look.
- Reply to comments in the first hour; if someone points out a mistake, thank them, pin a correction, fix it in the next part.

## 5. Policies you must respect (and how this studio helps)

- **Original, not mass-produced.** YouTube does not monetise repetitive, templated or mass-produced content, and reused content is risky.
  Templates are fine when every video has its **own script, voice-over, scenes and ideas**. Never upload the same structure with only the words swapped; vary hooks, scenes and length.
- **Do not copy other channels.** Take the *pattern* (curiosity hooks, short pacing), never another creator's topics list, scripts, footage, voice or layout.
- **Facts must be true.** Every facts Short needs 2 independent reliable sources noted in its `script.md` ("Sources"). Never present rumours as confirmed; say "माना जाता है" when it is a belief.
  Do not invent history or science. A wrong fact in a facts channel costs trust.
- **Mythology with care.** Follow a well-known retelling; label a folk version as folk. Deities are always shown with calm, respectful faces (the studio enforces it with the `sacred` look). No jokes at a deity's expense.
- **Answer content-label questions accurately.** In upload settings, answer the platform's "altered or synthetic content" question truthfully for each video, and check the platform's current guidance when unsure.
- **Music and sounds:** only tracks you have the rights to, or YouTube's own Audio Library. Keep the credit in the description.
- **Children:** if a video is directed at children, mark it as made for kids and keep content age-appropriate.
- **Monetisation thresholds change.** Check *YouTube Studio → Earn* for the current requirements (they combine subscribers with public Shorts views or watch hours).

## 6. Production routine for one Short (about 30–60 minutes after the first)

1. Pick the next topic from `channel/backlog.md`; check it has sources (facts) or a retelling (kahani).
2. `npm run new-story -- <slug> --title "..." --hook "<question>" --language hindi --style <style> --series "<series>" --part N`
3. Write the script (Facts: 35–50 Hindi words; Kahani: 7 beats). Approve it. Record or generate the voice into `voice/<slug>.mp3`.
4. `npm run timings -- voice/<slug>.mp3 --script stories/<slug>/voice.txt --language hi --out stories/<slug>/timings.json`
5. Fill `story.json`, `npm run storyboard -- <slug>`, review the sheet, give notes.
6. `npm run finish -- <slug> --music music/<track>.mp3`
7. `npm run youtube -- <slug>` writes `stories/<slug>/youtube.md`: title, description, hashtags, playlist, pinned comment, checklist.
8. Upload privately, check it on your phone with and without sound, then schedule it.

## 7. Weekly review (15 minutes)

- Which 2 Shorts had the best "stayed to watch" and why (hook, topic, length)? Make more like them.
- Which had the worst swipe-away rate? Rewrite that kind of hook.
- Update `channel/backlog.md`; keep 10 approved topics ahead so you never start from zero.
