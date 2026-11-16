import type {TimingsFile, Word} from '../lib/Captions';
import {FPS} from '../lib/theme';
import type {SceneSpec, StorySpec} from './types';

export type ResolvedScene = {spec: SceneSpec; from: number; frames: number};
export type Timeline = {scenes: ResolvedScene[]; totalFrames: number; sceneFrames: number[]; heroFrame: number};

const DEFAULT_SCENE_SECONDS = 6;

export const hasTimings = (t: TimingsFile | null | undefined): t is TimingsFile => !!t && t.words.length > 0;

/** lower-case, no punctuation: so "Kyun?" matches "kyun" */
const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '');

/** Index of the word where a spoken line starts, searching forward from `cursor`. */
const findLineStart = (line: string, words: Word[], cursor: number): number => {
  const tokens = line.split(/\s+/).map(norm).filter(Boolean);
  if (tokens.length === 0) return -1;
  for (let i = cursor; i < words.length; i++) {
    if (norm(words[i].word) !== tokens[0]) continue;
    if (tokens.length < 2 || norm(words[i + 1]?.word ?? '') === tokens[1]) return i;
  }
  for (let i = cursor; i < words.length; i++) if (norm(words[i].word) === tokens[0]) return i;
  return -1;
};

/**
 * Turns scenes + word timings into frame ranges. Each scene starts on the first word of its `line`,
 * so the picture follows the voice. Without timings, scenes use `duration` (default 6 s).
 */
export const resolveTimeline = (story: StorySpec, timings: TimingsFile | null | undefined): Timeline => {
  const timed = hasTimings(timings);
  const starts: number[] = [];
  let cursor = 0;

  story.scenes.forEach((scene, i) => {
    let start = scene.start;
    if (start === undefined && timed && scene.line) {
      const idx = findLineStart(scene.line, timings.words, cursor);
      if (idx < 0) {
        throw new Error(
          `Scene "${scene.id}": could not find its line "${scene.line.slice(0, 40)}" in the word timings. ` +
            `Make the line match voice.txt, or set "start" (seconds) on the scene.`,
        );
      }
      start = timings.words[idx].start;
      cursor = idx + 1;
    }
    if (start === undefined) start = i === 0 ? 0 : starts[i - 1] + (story.scenes[i - 1].duration ?? DEFAULT_SCENE_SECONDS);
    starts.push(i === 0 ? 0 : start);
  });

  const last = story.scenes.length - 1;
  const totalSeconds = timed
    ? timings.duration + (story.tail ?? 1)
    : story.duration ?? starts[last] + (story.scenes[last].duration ?? DEFAULT_SCENE_SECONDS);
  const totalFrames = Math.max(1, Math.round(totalSeconds * FPS));

  const froms = starts.map((s) => Math.round(s * FPS));
  const scenes = story.scenes.map((spec, i) => {
    if (i > 0 && froms[i] <= froms[i - 1]) {
      throw new Error(`Scene "${spec.id}" starts at or before the scene above it. Scenes must be in spoken order.`);
    }
    const end = i === last ? totalFrames : froms[i + 1];
    return {spec, from: froms[i], frames: Math.max(1, end - froms[i])};
  });

  const sceneFrames = scenes.map((s) => s.from + Math.floor(s.frames * 0.6));
  const hero = scenes[Math.min(story.heroScene ?? 0, last)];
  return {scenes, totalFrames, sceneFrames, heroFrame: hero.from + Math.floor(hero.frames * 0.6)};
};
