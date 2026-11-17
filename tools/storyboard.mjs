#!/usr/bin/env node
// Storyboard: render still frames BEFORE any full render, with the safe-zone guide on.
//
//   npm run storyboard -- <story-slug>              one still per scene, tiled into out/<slug>-storyboard.jpg
//   npm run storyboard -- <CompositionId> 0 45 89   stills of chosen frames -> out/storyboard/<id>-<frame>.png
import {renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {CHROMIUM, FRAME_TIMEOUT_MS, ROOT, bundleProject, die, pickComposition, run} from './lib.mjs';

const [id, ...frameArgs] = process.argv.slice(2);
if (!id) die('usage: npm run storyboard -- <story-slug>   or   npm run storyboard -- <CompositionId> <frame> [<frame> ...]');

const outDir = path.join(ROOT, 'out/storyboard');
fs.mkdirSync(outDir, {recursive: true});

const inputProps = {guides: true};
const serveUrl = await bundleProject();
const composition = await pickComposition(serveUrl, id, inputProps);
const perScene = frameArgs.length === 0;

let frames = frameArgs.map(Number);
if (perScene) {
  frames = composition.props.sceneFrames;
  if (!frames) die(`"${id}" is not a story, so give frame numbers: npm run storyboard -- ${id} 0 45 89`);
  for (const f of fs.readdirSync(outDir)) if (f.startsWith(`${id}-s`)) fs.rmSync(path.join(outDir, f));
}

const files = [];
for (const [i, frame] of frames.entries()) {
  const name = perScene ? `${id}-s${String(i + 1).padStart(2, '0')}.png` : `${id}-${frame}.png`;
  const output = path.join(outDir, name);
  await renderStill({composition, serveUrl, output, frame, inputProps, chromiumOptions: CHROMIUM, timeoutInMilliseconds: FRAME_TIMEOUT_MS});
  files.push(output);
  console.log(`still ${i + 1}/${frames.length}: frame ${frame}`);
}

if (perScene) {
  const cols = Math.min(frames.length, 4);
  const rows = Math.ceil(frames.length / cols);
  const sheet = path.join(ROOT, `out/${id}-storyboard.jpg`);
  run('ffmpeg', [
    '-v', 'error', '-y', '-framerate', '1', '-pattern_type', 'glob', '-i', path.join(outDir, `${id}-s*.png`),
    '-vf', `scale=360:-1,tile=${cols}x${rows}:padding=10:color=0x111111`, '-frames:v', '1', '-update', '1', sheet,
  ]);
  for (const f of files) fs.rmSync(f); // the sheet holds them all; do not leave per-scene stills behind
  if (!fs.readdirSync(outDir).length) fs.rmdirSync(outDir);
  console.log(`\nstoryboard sheet: ${path.relative(ROOT, sheet)}  (one picture per scene, in order)`);
  console.log('Check it, give your notes, fix them, and only then run: npm run finish -- ' + id);
}
