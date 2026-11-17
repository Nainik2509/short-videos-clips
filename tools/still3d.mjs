#!/usr/bin/env node
// Debug stills for a 3D story, with the browser's errors printed and the post chain switchable.
//
//   node tools/still3d.mjs <slug> <frame,frame,...> [--post '{"ink":false,"lens":false}'] [--scale 0.5] [--no-guides] [--cover]
//
// Writes out/storyboard/<slug>-<frame>.png. Post switches: ink, lens, bloom, grade (all on by default); dpr forces the WebGL buffer size.
import {renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {CHROMIUM, FRAME_TIMEOUT_MS, ROOT, bundleProject, die, pickComposition} from './lib.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const [slug, frameList] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!slug || !frameList) die("usage: node tools/still3d.mjs <slug> <frame,frame,...> [--post '{\"ink\":false}'] [--scale 0.5] [--no-guides]");

const inputProps = {guides: !args.includes('--no-guides'), cover: args.includes('--cover'), post: JSON.parse(flag('--post') ?? '{}')};
const scale = Number(flag('--scale') ?? 1);
const outDir = path.join(ROOT, 'out/storyboard');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundleProject();
const composition = await pickComposition(serveUrl, slug, inputProps);
for (const frame of frameList.split(',').map(Number)) {
  const output = path.join(outDir, `${slug}-${frame}.png`);
  const started = Date.now();
  await renderStill({
    composition, serveUrl, output, frame, inputProps, scale,
    chromiumOptions: CHROMIUM, timeoutInMilliseconds: FRAME_TIMEOUT_MS,
    onBrowserLog: (log) => {
      if (log.text.includes('THREE.Clock')) return; // three's own deprecation notice, nothing to fix here
      console.log(`[browser ${log.type}] ${log.text.slice(0, 400)}`);
    },
  });
  console.log(`frame ${frame}: ${((Date.now() - started) / 1000).toFixed(1)}s -> ${path.relative(ROOT, output)}`);
}
