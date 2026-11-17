#!/usr/bin/env node
// Pull reference videos you love and prepare them for study: "inspired by, not a copy".
//
//   npm run refs -- <link> [<link> ...]      download with yt-dlp into references/<id>/
//   npm run refs -- references/my-video.mp4  analyse a file you already have
//
// For each video you get: the video, a contact sheet (a frame every 2 seconds) and a transcript, so Claude can
// read the pacing, hook, captions and mood. Then fill in docs/research/STYLE.md (copy STYLE.template.md).
// Use references to learn a *pattern*. Never copy another creator's script, footage, characters or voice.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ROOT, die, probeSeconds, run} from '../shared/lib.mjs';

const inputs = process.argv.slice(2);
if (inputs.length === 0) die('usage: npm run refs -- <video link or file> [...]');

const python = path.join(os.homedir(), '.venvs/whisper/bin/python');
const refsDir = path.join(ROOT, 'references');
fs.mkdirSync(refsDir, {recursive: true});

const analyse = (file, dir) => {
  const seconds = probeSeconds(file);
  const sheet = path.join(dir, 'frames.jpg');
  const count = Math.max(1, Math.ceil(seconds / 2));
  const cols = Math.min(count, 6);
  run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', `fps=1/2,scale=216:-1,tile=${cols}x${Math.ceil(count / cols)}:padding=6:color=0x111111`, '-frames:v', '1', '-update', '1', sheet]);
  const transcript = path.join(dir, 'transcript.json');
  if (fs.existsSync(python)) {
    spawnSync(python, [path.join(ROOT, 'tools/story/timings.py'), file, '--out', transcript, '--model', 'base'], {stdio: 'inherit', cwd: ROOT});
  }
  console.log(`  ${path.relative(ROOT, dir)}/: ${seconds.toFixed(0)}s, frames.jpg${fs.existsSync(transcript) ? ', transcript.json' : ''}`);
};

for (const input of inputs) {
  if (/^https?:\/\//.test(input)) {
    const staging = fs.mkdtempSync(path.join(refsDir, '.dl-'));
    console.log(`downloading ${input}`);
    run('yt-dlp', ['--no-playlist', '-f', 'bv*[height<=1080]+ba/b', '--merge-output-format', 'mp4', '--write-info-json', '-o', path.join(staging, 'video.%(ext)s'), input]);
    const info = JSON.parse(fs.readFileSync(path.join(staging, 'video.info.json'), 'utf8'));
    const dir = path.join(refsDir, `${info.id}`);
    fs.rmSync(dir, {recursive: true, force: true});
    fs.renameSync(staging, dir);
    fs.writeFileSync(path.join(dir, 'source.txt'), `${input}\n${info.title ?? ''}\n${info.uploader ?? ''}\n`);
    analyse(path.join(dir, 'video.mp4'), dir);
  } else {
    const file = path.resolve(ROOT, input);
    if (!fs.existsSync(file)) die(`file not found: ${input}`);
    const dir = path.join(refsDir, path.basename(file, path.extname(file)));
    fs.mkdirSync(dir, {recursive: true});
    analyse(file, dir);
  }
}
const template = path.join(ROOT, 'docs/research/STYLE.template.md');
const style = path.join(ROOT, 'docs/research/STYLE.md');
if (!fs.existsSync(style) && fs.existsSync(template)) fs.copyFileSync(template, style);
console.log('\nNext: ask Claude to "read references/ and fill in docs/research/STYLE.md: inspired by, not a copy".');
