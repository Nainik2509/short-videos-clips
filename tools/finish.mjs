#!/usr/bin/env node
// Finish a reel: render the picture, mix voice + music, and export for Instagram.
//
//   npm run finish -- <story-slug> [--music music/track.mp3]
//
// Needs the storyboard sheet first (npm run storyboard -- <slug>); that is the studio rule.
// Writes: out/<slug>-final.mp4 (1080x1920, 30fps, H.264 ~16 Mbps, AAC, -14 LUFS),
//         out/<slug>-qc.jpg (contact sheet, a frame every 2.5 s), out/<slug>-cover.jpg (the hook over the hero frame).
import {renderMedia, renderStill} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, bundleProject, die, pickComposition, run} from './lib.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
if (!slug) die('usage: npm run finish -- <story-slug> [--music music/track.mp3]');
const musicFlag = args.indexOf('--music');
const musicArg = musicFlag >= 0 ? args[musicFlag + 1] : undefined;

const storyDir = path.join(ROOT, 'stories', slug);
if (!fs.existsSync(storyDir)) die(`stories/${slug}/ not found.`);

// Rule: storyboard before any full render, and it must be newer than the story files.
const sheet = path.join(ROOT, `out/${slug}-storyboard.jpg`);
const newest = Math.max(...['story.json', 'timings.json'].map((f) => fs.statSync(path.join(storyDir, f)).mtimeMs));
if (!fs.existsSync(sheet) || fs.statSync(sheet).mtimeMs < newest) {
  die(`no up-to-date storyboard. Run: npm run storyboard -- ${slug}   (check the sheet, then run finish again)`);
}

const findAudio = (dir, names) => {
  for (const name of names) for (const ext of ['mp3', 'wav', 'm4a', 'aiff', 'aac']) {
    const file = path.join(ROOT, dir, `${name}.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
};
const voice = findAudio('voice', [slug]);
const music = musicArg ? path.resolve(ROOT, musicArg) : findAudio('music', [slug]);
if (musicArg && !fs.existsSync(music)) die(`music file not found: ${musicArg}`);
if (!voice) console.log(`note: no voice/${slug}.* found; the reel will have ${music ? 'music only' : 'no sound'}.`);

const serveUrl = await bundleProject();
const composition = await pickComposition(serveUrl, slug);
const silent = path.join(ROOT, `out/${slug}.mp4`);
const final = path.join(ROOT, `out/${slug}-final.mp4`);

// 1. picture
let lastPct = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  imageFormat: 'jpeg',
  videoBitrate: '16M',
  outputLocation: silent,
  onProgress: ({progress}) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== lastPct) console.log(`rendering ${pct}%`), (lastPct = pct);
  },
});
const seconds = composition.durationInFrames / composition.fps;

// 2. sound: voice normalised, music about 8 dB under it and ducking when the voice speaks,
//    then a measured gain to -14 LUFS with a limiter so peaks stay under -1 dB.
const TARGET_LUFS = -14;
const PEAK_LIMIT = 0.84; // -1.5 dBFS, leaves room for the AAC encoder
let finalAudio = [];
if (voice || music) {
  const input = [];
  const filters = [];
  if (voice) input.push('-i', voice);
  if (music) input.push('-stream_loop', '-1', '-i', music);
  const fadeOut = `afade=t=out:st=${Math.max(0, seconds - 1).toFixed(2)}:d=1`;
  if (voice && music) {
    filters.push(
      `[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,asplit=2[v][vside]`,
      `[1:a]volume=-8dB,${fadeOut}[m0]`,
      `[m0][vside]sidechaincompress=threshold=0.03:ratio=4:attack=30:release=600[m]`,
      `[v][m]amix=inputs=2:duration=longest:normalize=0[a]`,
    );
  } else if (voice) {
    filters.push(`[0:a]anull[a]`);
  } else {
    filters.push(`[0:a]${fadeOut}[a]`);
  }
  const mix = path.join(ROOT, `out/${slug}-mix.wav`);
  run('ffmpeg', ['-v', 'error', '-y', ...input, '-filter_complex', filters.join(';'), '-map', '[a]', '-t', seconds.toFixed(3), '-ar', '48000', mix]);

  const measure = spawnSync('ffmpeg', ['-nostats', '-i', mix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {encoding: 'utf8'});
  const block = measure.stderr.match(/\{[^{}]*\}/g)?.at(-1);
  if (!block) die('could not measure loudness (see: ffmpeg -i out/<slug>-mix.wav -af loudnorm=print_format=json -f null -).');
  const m = JSON.parse(block);
  const gain = (TARGET_LUFS - Number(m.input_i)).toFixed(2);
  const wav = path.join(ROOT, `out/${slug}-mastered.wav`);
  run('ffmpeg', ['-v', 'error', '-y', '-i', mix, '-af', `volume=${gain}dB,alimiter=limit=${PEAK_LIMIT}:level=disabled`, '-ar', '48000', wav]);
  fs.rmSync(mix);
  finalAudio = ['-i', wav];
}
run('ffmpeg', [
  '-v', 'error', '-y', '-i', silent, ...finalAudio,
  '-map', '0:v', ...(finalAudio.length ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '192k'] : []),
  '-c:v', 'copy', '-t', seconds.toFixed(3), '-movflags', '+faststart', final,
]);
fs.rmSync(path.join(ROOT, `out/${slug}-mastered.wav`), {force: true});

// 3. contact sheet to check the whole reel at a glance
const frames = Math.ceil(seconds / 2.5);
const qc = path.join(ROOT, `out/${slug}-qc.jpg`);
run('ffmpeg', ['-v', 'error', '-y', '-i', final, '-vf', `fps=1/2.5,scale=216:-1,tile=6x${Math.ceil(frames / 6)}:padding=6:color=0x111111`, '-frames:v', '1', '-update', '1', qc]);

// 4. cover: the question as the title over the hero frame
const coverProps = {cover: true};
const coverComposition = await pickComposition(serveUrl, slug, coverProps);
const cover = path.join(ROOT, `out/${slug}-cover.jpg`);
await renderStill({composition: coverComposition, serveUrl, output: cover, frame: coverComposition.props.heroFrame, imageFormat: 'jpeg', inputProps: coverProps});

const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate', '-of', 'compact', final], {encoding: 'utf8'});
console.log(`\n${probe.stdout.trim()}`);
console.log(`final: out/${slug}-final.mp4\nqc:    out/${slug}-qc.jpg\ncover: out/${slug}-cover.jpg`);
console.log(`caption: write it in stories/${slug}/caption.md`);
console.log('Before posting: watch on your phone with sound and without; question on screen in the first second; names spelled right; Instagram AI label on.');
