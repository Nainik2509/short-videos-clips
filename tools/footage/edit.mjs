#!/usr/bin/env node
// Edit your own footage: cut the dead air, add captions, a hook and music, export for Instagram / Shorts.
//
//   npm run edit -- raw-footage/my-clip.mp4 --hook "Yeh galti sab karte hain" --language hi --music music/track.mp3
//
// First run: cut -> transcribe -> render. Settings are saved in work/<name>/edit.json, so to change something
// (a bigger hook, no captions, quieter music) edit that file or pass the flag again, then run the same command:
// the cut and the transcript are reused, only the render repeats. Add --force to redo the cut and transcript.
//
// Flags: --hook "text"  --hook-size 84  --hook-seconds 3  --language en|hi|hinglish|other (caption font)
//        --whisper-language en|hi  --script voice.txt  --music file  --music-volume 0.16  --no-captions
//        --keep-pauses  --silence-db -32  --min-silence 0.5  --model small  --force
import {renderMedia} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ROOT, bundleProject, die, hasAudio, normalizeLoudness, pickComposition, probeSeconds, run} from '../shared/lib.mjs';

const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(['hook', 'hook-size', 'hook-seconds', 'language', 'whisper-language', 'script', 'music', 'music-volume', 'caption-size', 'silence-db', 'min-silence', 'model']);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) positional.push(argv[i]);
  else if (VALUE_FLAGS.has(argv[i].slice(2))) flags[argv[i].slice(2)] = argv[++i];
  else flags[argv[i].slice(2)] = true;
}
const flag = (name) => (typeof flags[name] === 'string' ? flags[name] : undefined);
const bool = (name) => flags[name] === true;
const first = positional[0];
if (!first) die('usage: npm run edit -- raw-footage/my-clip.mp4 [--hook "..."] [--language hi] [--music music/track.mp3]');

// find the footage: a path, or just the name of a file in raw-footage/
const resolveSource = (arg) => {
  const direct = path.resolve(ROOT, arg);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const dir = path.join(ROOT, 'raw-footage');
  const stem = path.basename(arg, path.extname(arg));
  const hit = fs.existsSync(dir) ? fs.readdirSync(dir).find((f) => path.basename(f, path.extname(f)) === stem) : undefined;
  return hit ? path.join(dir, hit) : null;
};
const workDir0 = (name) => path.join(ROOT, 'work', name);

const source = resolveSource(first);
const name = path.basename(first, path.extname(first));
const workDir = workDir0(name);
const specPath = path.join(workDir, 'edit.json');
fs.mkdirSync(workDir, {recursive: true});
if (!source) die(`could not find "${first}". Put your footage in raw-footage/ and use its name.`);

// ---- settings (saved, so later runs keep them) ----
const saved = fs.existsSync(specPath) ? JSON.parse(fs.readFileSync(specPath, 'utf8')) : {};
const num = (v, fallback) => (v === undefined ? fallback : Number(v));
const spec = {
  name,
  language: flag('language') ?? saved.language ?? 'english',
  whisperLanguage: flag('whisper-language') ?? saved.whisperLanguage ?? '',
  hook: flag('hook') ?? saved.hook ?? '',
  hookSize: num(flag('hook-size'), saved.hookSize ?? 84),
  hookSeconds: num(flag('hook-seconds'), saved.hookSeconds ?? 3),
  captions: bool('no-captions') ? false : saved.captions ?? true,
  captionSize: num(flag('caption-size'), saved.captionSize ?? 0),
  music: flag('music') ?? saved.music ?? '',
  musicVolume: num(flag('music-volume'), saved.musicVolume ?? 0.16),
  silenceDb: num(flag('silence-db'), saved.silenceDb ?? -32),
  minSilence: num(flag('min-silence'), saved.minSilence ?? 0.5),
  keepPauses: bool('keep-pauses') || (saved.keepPauses ?? false),
  script: flag('script') ?? saved.script ?? '',
  model: flag('model') ?? saved.model ?? 'small',
};
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
const force = bool('force');
// A step is redone when its output is missing, an input changed, or its own settings changed.
const stale = (target, key) => {
  const keyFile = `${target}.key`;
  const changed = !fs.existsSync(target) || !fs.existsSync(keyFile) || fs.readFileSync(keyFile, 'utf8') !== key;
  if (force || changed) {
    fs.writeFileSync(keyFile, key);
    return true;
  }
  return false;
};

// ---- 1. cut the dead air ----
const cutFile = path.join(workDir, 'cut.mp4');
const cutKey = JSON.stringify([fs.statSync(source).mtimeMs, spec.silenceDb, spec.minSilence, spec.keepPauses]);
if (stale(cutFile, cutKey)) {
  if (!hasAudio(source)) die('this footage has no sound, so there is nothing to cut by. Add --keep-pauses to skip cutting.');
  const total = probeSeconds(source);
  let keep = [[0, total]];
  if (!spec.keepPauses) {
    const detect = spawnSync('ffmpeg', ['-nostats', '-i', source, '-af', `silencedetect=noise=${spec.silenceDb}dB:d=${spec.minSilence}`, '-f', 'null', '-'], {encoding: 'utf8'});
    const starts = [...detect.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
    const ends = [...detect.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
    if (starts.length > ends.length) ends.push(total);
    const PAD = 0.12; // keep a little breath around the words so cuts do not clip them
    keep = [];
    let cursor = 0;
    starts.forEach((s, i) => {
      const end = Math.min(total, s + PAD);
      if (end - cursor > 0.3) keep.push([cursor, end]);
      cursor = Math.max(cursor, Math.max(0, ends[i] - PAD));
    });
    if (total - cursor > 0.3) keep.push([cursor, total]);
    if (keep.length === 0) keep = [[0, total]];
  }
  const fit = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1';
  const graph = keep
    .map(([s, e], i) => `[0:v]trim=start=${s.toFixed(3)}:end=${e.toFixed(3)},setpts=PTS-STARTPTS,${fit}[v${i}];[0:a]atrim=start=${s.toFixed(3)}:end=${e.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`)
    .concat(`${keep.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${keep.length}:v=1:a=1[v][a]`)
    .join(';\n');
  const graphFile = path.join(workDir, 'cut.filter');
  fs.writeFileSync(graphFile, graph);
  run('ffmpeg', ['-v', 'error', '-y', '-i', source, '-/filter_complex', graphFile, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', cutFile]);
  const after = probeSeconds(cutFile);
  console.log(`cut dead air: ${total.toFixed(1)}s -> ${after.toFixed(1)}s (${keep.length} pieces, ${(total - after).toFixed(1)}s removed)`);
} else {
  console.log('cut: reusing the saved cut (use --force to redo)');
}
const seconds = probeSeconds(cutFile);

// ---- 2. captions: word timings of the cut ----
const timingsFile = path.join(workDir, 'timings.json');
const timingsKey = JSON.stringify([cutKey, spec.model, spec.whisperLanguage, spec.language, spec.script && fs.existsSync(path.resolve(ROOT, spec.script)) ? fs.statSync(path.resolve(ROOT, spec.script)).mtimeMs : 0]);
if (spec.captions && stale(timingsFile, timingsKey)) {
  const python = path.join(os.homedir(), '.venvs/whisper/bin/python');
  if (!fs.existsSync(python)) die('word timings need the whisper environment: see README ("Requirements").');
  const args = [path.join(ROOT, 'tools/story/timings.py'), cutFile, '--out', timingsFile, '--model', spec.model];
  const wl = spec.whisperLanguage || {hi: 'hi', hindi: 'hi', hinglish: 'hi', english: 'en', en: 'en'}[spec.language];
  if (wl) args.push('--language', wl);
  if (spec.script) args.push('--script', path.resolve(ROOT, spec.script));
  run(python, args);
}

// ---- 3. build: footage + hook + captions + music ----
const publicDir = path.join(ROOT, 'public/footage');
fs.mkdirSync(publicDir, {recursive: true});
fs.copyFileSync(cutFile, path.join(publicDir, `${name}.mp4`));
let music = '';
if (spec.music) {
  const musicSource = path.resolve(ROOT, spec.music);
  if (!fs.existsSync(musicSource)) die(`music file not found: ${spec.music}`);
  music = `footage/${name}-music${path.extname(musicSource)}`;
  fs.copyFileSync(musicSource, path.join(ROOT, 'public', music));
}
const languageKey = {hi: 'hindi', en: 'english'}[spec.language] ?? spec.language;
const props = {
  spec: {
    name, src: `footage/${name}.mp4`, durationSeconds: seconds, language: languageKey, hook: spec.hook, hookSize: spec.hookSize,
    hookSeconds: spec.hookSeconds, captions: spec.captions, captionSize: spec.captionSize, music, musicVolume: spec.musicVolume,
  },
  timings: spec.captions && fs.existsSync(timingsFile) ? JSON.parse(fs.readFileSync(timingsFile, 'utf8')) : null,
  guides: false,
};

const serveUrl = await bundleProject();
const composition = await pickComposition(serveUrl, 'EditReel', props);
fs.mkdirSync(path.join(ROOT, 'exports'), {recursive: true});
const raw = path.join(workDir, 'render.mp4');
let last = -1;
await renderMedia({
  composition, serveUrl, codec: 'h264', imageFormat: 'jpeg', videoBitrate: '16M', outputLocation: raw, inputProps: props,
  onProgress: ({progress}) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) console.log(`rendering ${pct}%`), (last = pct);
  },
});

// ---- 4. export: loudness fix + contact sheet ----
const final = path.join(ROOT, `exports/${name}-final.mp4`);
normalizeLoudness(raw, final);
const qc = path.join(ROOT, `exports/${name}-qc.jpg`);
run('ffmpeg', ['-v', 'error', '-y', '-i', final, '-vf', `fps=1/2.5,scale=216:-1,tile=6x${Math.max(1, Math.ceil(seconds / 2.5 / 6))}:padding=6:color=0x111111`, '-frames:v', '1', '-update', '1', qc]);
fs.rmSync(path.join(publicDir, `${name}.mp4`), {force: true});
if (music) fs.rmSync(path.join(ROOT, 'public', music), {force: true});

console.log(`\nfinal: exports/${name}-final.mp4  (${seconds.toFixed(1)}s)\nqc:    exports/${name}-qc.jpg`);
console.log(`To change something, edit work/${name}/edit.json (or pass the flag) and run the same command again.`);
