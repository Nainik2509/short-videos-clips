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
import re
import subprocess
import sys
import unicodedata
from pathlib import Path


def spoken_length(word: str) -> float:
    """Rough speaking time of a word: its number of letters (about one syllable each in Hindi),
    ignoring vowel signs and virama, plus a little for the pause after punctuation."""
    letters = sum(1 for ch in word if unicodedata.category(ch).startswith("L") or ch.isdigit())
    return max(1.0, letters) + (0.6 if re.search(r"[,.;:?!।]", word) else 0.0)


def find_silences(audio: str, noise_db: int = -35, min_len: float = 0.25) -> list:
    """Silent stretches [(start, end), ...] of the recording, found with ffmpeg."""
    r = subprocess.run(
        ["ffmpeg", "-nostats", "-i", audio, "-af", f"silencedetect=noise={noise_db}dB:d={min_len}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    starts = [float(m) for m in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    if len(starts) > len(ends):
        ends.append(float("inf"))  # recording ends in silence
    return list(zip(starts, ends))


def align_script_voiced(script_text: str, asr: list, audio: str, duration: float):
    """Frame-accurate alignment for a script of one spoken line per text line.

    1. Find the real silences in the recording.
    2. Choose the N-1 silences that are the pauses BETWEEN script lines: long pauses
       that sit closest to where the recogniser says each line starts.
    3. Inside each line, spread the words over the voiced time only (pauses at commas
       are skipped), in proportion to word length.
    Returns None when the recording does not fit the script (caller falls back).
    """
    lines = [l.split() for l in script_text.splitlines() if l.strip()]
    n_lines = len(lines)
    silences = find_silences(audio)
    if n_lines < 1 or not asr:
        return None

    # leading / trailing silence trim the voiced range
    voice_start = silences[0][1] if silences and silences[0][0] <= 0.05 else 0.0
    voice_end = silences[-1][0] if silences and silences[-1][1] == float("inf") else duration
    gaps = [(a, b) for a, b in silences if a > voice_start + 0.05 and b < voice_end - 0.05 and b - a >= 0.3]

    # where the recogniser puts each line start (global proportional estimate)
    total_words = sum(len(l) for l in lines)
    est, count = [], 0
    for l in lines:
        pos = count * len(asr) / total_words
        i = min(int(pos), len(asr) - 1)
        est.append(asr[i]["start"] + (pos - i) * (asr[i]["end"] - asr[i]["start"]))
        count += len(l)

    boundaries = []  # chosen gaps, one per line break
    if n_lines > 1:
        if len(gaps) < n_lines - 1:
            return None
        INF = float("inf")
        cost = lambda g, i: abs((g[0] + g[1]) / 2 - est[i]) - 2.0 * (g[1] - g[0])
        # DP over lines, gaps strictly increasing
        best = [[INF] * len(gaps) for _ in range(n_lines - 1)]
        prev = [[-1] * len(gaps) for _ in range(n_lines - 1)]
        for j, g in enumerate(gaps):
            best[0][j] = cost(g, 1)
        for i in range(1, n_lines - 1):
            for j, g in enumerate(gaps):
                for k in range(j):
                    if best[i - 1][k] + cost(g, i + 1) < best[i][j]:
                        best[i][j] = best[i - 1][k] + cost(g, i + 1)
                        prev[i][j] = k
        j = min(range(len(gaps)), key=lambda j: best[n_lines - 2][j])
        chosen = [j]
        for i in range(n_lines - 2, 0, -1):
            j = prev[i][j]
            chosen.append(j)
        boundaries = [gaps[j] for j in reversed(chosen)]

    # voiced intervals between all silences
    inner = [(a, b) for a, b in silences if a > voice_start and b < voice_end]
    voiced, cur = [], voice_start
    for a, b in inner:
        if a > cur:
            voiced.append((cur, a))
        cur = max(cur, b)
    if voice_end > cur:
        voiced.append((cur, voice_end))

    out = []
    for i, words in enumerate(lines):
        lo = boundaries[i - 1][1] if i > 0 else voice_start
        hi = boundaries[i][0] if i < n_lines - 1 else voice_end
        spans = [(max(a, lo), min(b, hi)) for a, b in voiced if b > lo and a < hi]
        spans = [(a, b) for a, b in spans if b - a > 0.02] or [(lo, hi)]
        total = sum(b - a for a, b in spans)
        weights = [spoken_length(w) for w in words]
        wsum = sum(weights)

        def at(frac):  # position in voiced time -> real time
            target = frac * total
            for a, b in spans:
                if target <= b - a:
                    return a + target
                target -= b - a
            return spans[-1][1]

        c = 0
        for w, wt in zip(words, weights):
            out.append({"word": w, "start": round(at(c / wsum), 3), "end": round(at((c + wt) / wsum), 3)})
            c += wt
    return out


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
              "or ~/.venvs/whisper/bin/python tools/story/timings.py ...", file=sys.stderr)
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
        script_text = script_path.read_text(encoding="utf-8")
        exact = align_script_voiced(script_text, words, str(audio), info.duration)
        if exact:
            words = exact
            print("aligned to the recording's real pauses (frame-accurate line starts)")
        else:
            print("note: could not match the script to the recording's pauses; used the estimate", file=sys.stderr)
            words = align_script(script_text, words)

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
