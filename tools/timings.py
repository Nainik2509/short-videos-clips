#!/usr/bin/env python3
"""Turn a voice-over into word timings (every word with start and end seconds).

Usage (from the project root):
    npm run timings -- voice/my-story.mp3 --out stories/my-story/timings.json
    npm run timings -- voice/my-story.mp3 --script stories/my-story/voice.txt --language hi --out stories/my-story/timings.json

With --script, the captions use YOUR words (exactly as written in the script, in English letters
or Devanagari) and borrow the timing from the speech recogniser. Use it for Hinglish and Hindi:
the recogniser often spells those words differently from your script.

Needs the faster-whisper virtual environment (~/.venvs/whisper); `npm run timings`
already uses it. Output JSON:
    {"audio": "...", "language": "en", "duration": 58.2,
     "words": [{"word": "Once", "start": 0.12, "end": 0.40}, ...]}
"""
import argparse
import json
import sys
from pathlib import Path


def align_script(script_text: str, asr: list) -> list:
    """Give each word of the script a start/end time, using the recogniser's words as a clock.

    Script word j of N is placed at the same relative position as recogniser word j*M/N of M,
    so pauses and speed changes in the real voice are kept, and the words stay yours.
    """
    script_words = script_text.split()
    n, m = len(script_words), len(asr)
    if n == 0 or m == 0:
        return asr

    def time_at(pos: float) -> float:
        # position in recogniser-word units: 0 = start of word 0, m = end of the last word
        i = min(int(pos), m - 1)
        frac = pos - i
        return asr[i]["start"] + frac * (asr[i]["end"] - asr[i]["start"])

    out = []
    for j, w in enumerate(script_words):
        out.append({"word": w, "start": round(time_at(j * m / n), 3), "end": round(time_at((j + 1) * m / n), 3)})
    return out


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("audio", help="voice-over file (mp3, wav, m4a ...)")
    p.add_argument("--out", help="output JSON path (default: <audio name>.timings.json next to the audio)")
    p.add_argument("--model", default="small", help="whisper model: tiny, base, small (default), medium, large-v3")
    p.add_argument("--language", default=None, help="language code such as en or hi (default: auto-detect)")
    p.add_argument("--script", help="text file with the spoken lines; captions then use your words, timed by the voice")
    p.add_argument("--prompt", default=None, help="optional hint text (names, Sanskrit/Hindi words) to improve spelling")
    args = p.parse_args()

    audio = Path(args.audio)
    if not audio.exists():
        print(f"error: audio file not found: {audio}", file=sys.stderr)
        return 1

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("error: faster-whisper missing. Run via `npm run timings -- ...` "
              "or ~/.venvs/whisper/bin/python tools/timings.py ...", file=sys.stderr)
        return 1

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(audio),
        language=args.language,
        word_timestamps=True,
        initial_prompt=args.prompt,
        vad_filter=True,
    )

    words = []
    for seg in segments:
        for w in seg.words or []:
            text = w.word.strip()
            if text:
                words.append({"word": text, "start": round(w.start, 3), "end": round(w.end, 3)})

    if args.script:
        script_path = Path(args.script)
        if not script_path.exists():
            print(f"error: script file not found: {script_path}", file=sys.stderr)
            return 1
        words = align_script(script_path.read_text(encoding="utf-8"), words)

    out = Path(args.out) if args.out else audio.with_suffix(".timings.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "audio": str(audio),
        "language": info.language,
        "duration": round(info.duration, 3),
        "words": words,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(words)} words -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
