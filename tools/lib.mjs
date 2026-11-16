// Shared helpers for the studio tools (storyboard.mjs, finish.mjs).
import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const die = (message) => {
  console.error(`error: ${message}`);
  process.exit(1);
};

/** Bundles the Remotion project once and returns the URL the renderer reads from. */
export const bundleProject = async () => {
  process.stdout.write('bundling the project... ');
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts')});
  console.log('done');
  return serveUrl;
};

/** Looks up a composition; its `props` include sceneFrames and heroFrame worked out from the voice timings. */
export const pickComposition = async (serveUrl, id, inputProps = {}) => {
  try {
    return await selectComposition({serveUrl, id, inputProps});
  } catch (error) {
    die(`could not open composition "${id}". Is the story registered in stories/registry.ts? (${error.message.split('\n')[0]})`);
  }
};

/** Runs a command and stops with a clear message if it fails. */
export const run = (command, args) => {
  const result = spawnSync(command, args, {stdio: 'inherit', cwd: ROOT});
  if (result.status !== 0) die(`${command} failed (see the lines above).`);
};

/** Seconds of a media file. */
export const probeSeconds = (file) => {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {encoding: 'utf8'});
  const n = Number(r.stdout.trim());
  if (!Number.isFinite(n)) die(`could not read ${file}. Is it a video or audio file?`);
  return n;
};

/** True if the file has an audio stream. */
export const hasAudio = (file) =>
  spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file], {encoding: 'utf8'}).stdout.trim() !== '';

/**
 * Sets the sound of a video to about -14 LUFS with peaks under -1.5 dBFS (a measured gain plus a limiter).
 * The picture is copied untouched.
 */
export const normalizeLoudness = (input, output) => {
  const measure = spawnSync('ffmpeg', ['-nostats', '-i', input, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {encoding: 'utf8'});
  const block = measure.stderr.match(/\{[^{}]*\}/g)?.at(-1);
  if (!block) die(`could not measure the loudness of ${input}.`);
  const gain = (-14 - Number(JSON.parse(block).input_i)).toFixed(2);
  run('ffmpeg', ['-v', 'error', '-y', '-i', input, '-af', `volume=${gain}dB,alimiter=limit=0.84:level=disabled`, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output]);
};
