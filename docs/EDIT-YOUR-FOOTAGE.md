# Edit your own footage: from an empty folder to a finished reel

The studio has three folders for this: `raw-footage/` (your clips), `references/` (videos you love) and `exports/` (finished reels).
Five tools do the work, and they are already installed: **Remotion** and **Hyperframes** build the video and graphics, **FFmpeg**
cuts and exports, **Whisper** makes captions, **yt-dlp** pulls reference videos. You never type commands: tell Claude, or copy the lines below.

## 1. Teach Claude your style (once)

Pick 3–5 videos you love and give Claude the links:

> Download these references and study them: <link 1> <link 2> <link 3>. Fill in references/STYLE.md and add my edit style to CLAUDE.md.
> Inspired by, not a copy: borrow the pattern (hook type, pacing, captions, music mood), never their script, footage, voice or layout.

Claude runs `npm run refs -- <links>`, looks at each video's frames and transcript, and writes your style down.
That one line, **inspired by, not a copy**, is what keeps your videos from looking like everyone else's.

## 2. Film the way you normally do

Drop the file into `raw-footage/`. Your originals are never changed.

## 3. Tell Claude to edit

> Edit raw-footage/my-clip.mp4 in my style. Hook: "<your first line>". Language: Hinglish. Add music from music/track.mp3.

Claude runs `npm run edit -- raw-footage/my-clip.mp4 --hook "..." --language hinglish --music music/track.mp3`:

1. **Cuts the dead air** (pauses over half a second, keeping a small breath so words are not clipped) and fits it to 1080×1920.
2. **Captions** every word with Whisper (3–4 words at a time, the spoken word highlighted, inside the safe zone).
3. **Hook** big at the top for the first 3 seconds, **music** that gets quieter while you speak and fades out at the end.
4. **Exports** `exports/my-clip-final.mp4` (sound set to about -14 LUFS) and `exports/my-clip-qc.jpg` (a frame every 2.5 s to check it at a glance).

## 4. Review: just say what is off

Watch it on your phone. Then tell Claude, for example:

| You say | Claude changes |
|---|---|
| "Make the hook bigger" | `--hook-size 120` |
| "Captions are too big" | `--caption-size 56` |
| "Music is too loud" | `--music-volume 0.1` |
| "The cuts feel too tight" | `--min-silence 0.8` |
| "Take the captions off" | `--no-captions` |
| "Different hook" | `--hook "..."` |

The settings are saved in `work/my-clip/edit.json`. Each fix re-renders in about 10 seconds because the cut and the transcript are reused.

## Notes

- **Hinglish:** Whisper writes Hindi speech in Devanagari. For Roman letters, put the exact words in a text file and add `--script words.txt`.
- **No sound in the clip?** Use `--keep-pauses` (nothing to cut by), or use the story pipeline instead.
- **Safe zone:** hook and captions stay inside it, away from Instagram's buttons and caption bar.
- **Respect and rights:** use music you have the rights to, switch on the AI label if you used AI voice or graphics, and never copy another creator's work.

## Optional skills (not installed)

A video you may be following suggests five free Claude skills. None is installed here; ask Claude to install any you want:
the Instagram agent skill (grades a hook before you film), a marketing skills pack (e.g. removes "it's not X, it's Y" AI tells),
Remotion's official skills (Claude writes video as code), Remocn (ready-made Remotion animations), and Anthropic's Skill Creator
(give it your 3 best posts and ask for a skill in your voice, so every caption sounds like you).
