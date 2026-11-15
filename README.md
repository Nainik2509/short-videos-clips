# Cartoon Short Kit
By **Nainik Mehta**. Audio in, finished vertical cartoon short out. 2D bean-head cards in an inked,
painted 3D world (three.js in headless Chromium, no GPU needed), with a synthesized music bed and SFX.

```
SKILL.md                 Claude skill: idea -> script -> voiceover -> MP4 workflow
kit/
  engine/                renderer: main.js (world, ink, DOF, grade), paint.js (textures),
                         roman.js (cast), motion.js (cameras/easing), index.html
  tools/                 setup.sh, timing.py, render.mjs, sheet.py, mix.py, finish.sh
  example/soldier/       worked example: story.js (shot plan) + audio.py (cue table) + stills.jpg
  vendor/                three.js r160 and toon.ts, bundled so setup works offline
LICENSE                  MIT, Nainik Mehta
THIRD_PARTY_NOTICES.md   licenses of the bundled libraries
```

Requirements: Node 22.6+, Python 3 (numpy, Pillow), ffmpeg, Playwright + Chromium.

Quick start:
```bash
bash kit/tools/setup.sh ~/shorts/my-short && cd ~/shorts/my-short
python3 timing.py voice.mp3 script.txt --out work     # word timings
node render.mjs frames "0-590"                          # frames
python3 audio.py && python3 mix.py voice.mp3 music.wav sfx.wav
bash finish.sh "My Short"                               # encode + QA
```
