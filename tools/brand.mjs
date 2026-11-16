#!/usr/bin/env node
// Render the channel branding into brand/: profile picture, banner and the animated logo sting.
//
//   npm run brand            everything
//   npm run brand -- logo    just the profile picture (also: banner, sting)
import {renderMedia, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, bundleProject, die, pickComposition, run} from './lib.mjs';

const only = process.argv[2];
if (only && !['logo', 'banner', 'sting'].includes(only)) die('usage: npm run brand [-- logo|banner|sting]');
const out = path.join(ROOT, 'brand');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundleProject();

const still = async (id, file) => {
  const composition = await pickComposition(serveUrl, id);
  await renderStill({composition, serveUrl, output: path.join(out, file), frame: 0});
  console.log(`brand/${file}`);
};

if (!only || only === 'logo') await still('LogoMark', 'logo-icon.png');
if (!only || only === 'banner') await still('ChannelBanner', 'channel-banner.png');
if (!only || only === 'sting') {
  const composition = await pickComposition(serveUrl, 'LogoSting');
  const mp4 = path.join(out, 'logo-sting.mp4');
  await renderMedia({composition, serveUrl, codec: 'h264', imageFormat: 'jpeg', outputLocation: mp4});
  run('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', 'fps=12,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse', path.join(out, 'logo-sting-preview.gif')]);
  console.log('brand/logo-sting.mp4, brand/logo-sting-preview.gif');
}
