#!/usr/bin/env python3
# Cartoon Short Kit - (c) 2026 Nainik Mehta. MIT License.
"""Level-locked mix: voice stays untouched, music = 50 % of voice gated RMS (-6 dB),
SFX = 50 % with peaks capped at 0.7x the voice peak. One linear gain per stem, no ducking or compression.

Usage: python3 mix.py voice.mp3 music.wav sfx.wav [--out mix_raw.wav]
"""
import sys, subprocess, wave
import numpy as np

SR = 48000
args = [a for a in sys.argv[1:] if not a.startswith("--")]
out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "mix_raw.wav"
if "--out" in sys.argv: args.remove(out)
voice_p, music_p, sfx_p = args[:3]


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def gated_rms(x, win=0.4, gate_db=-45):
    n = int(win * SR); blocks = [x[i:i + n] for i in range(0, len(x) - n + 1, n)] or [x]
    r = np.array([np.sqrt(np.mean(b ** 2)) for b in blocks])
    keep = r[20 * np.log10(r + 1e-9) > gate_db]
    return float(np.sqrt(np.mean(keep ** 2))) if len(keep) else float(np.sqrt(np.mean(x ** 2)) + 1e-9)


def db(a, b): return 20 * np.log10((a + 1e-9) / (b + 1e-9))


voice = load(voice_p); N = len(voice)
fit = lambda x: np.pad(x, (0, max(0, N - len(x))))[:N]
music, sfx = fit(load(music_p)), fit(load(sfx_p))
vr, vpk = gated_rms(voice), float(np.abs(voice).max())

music *= 0.5 * vr / gated_rms(music)
sfx *= 0.5 * vr / gated_rms(sfx)
pk = float(np.abs(sfx).max())
if pk > 0.7 * vpk: sfx *= 0.7 * vpk / pk          # cap hits so nothing pokes over the narration

mix = voice + music + sfx
fade = int(0.04 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
g = min(1.0, 0.95 / (np.abs(mix).max() + 1e-9))   # single linear gain only if it would clip
mix *= g
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"music {db(gated_rms(music), vr):+.1f} dB vs voice | sfx {db(gated_rms(sfx), vr):+.1f} dB vs voice "
      f"| sfx peak {np.abs(sfx).max() / vpk:.2f}x voice peak | wrote {out}")
