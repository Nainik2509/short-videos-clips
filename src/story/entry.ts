import type {TimingsFile} from '../lib/Captions';
import {languages} from '../lib/languages';
import {palettes} from '../lib/palettes';
import {looks} from '../rig';
import {styles} from '../styles';
import {videos3d} from '../videos';
import {hasTimings} from './timeline';
import type {StorySpec} from './types';

export type StoryEntry = {story: StorySpec; timings: TimingsFile | null};

const fail = (slug: string, msg: string): never => {
  throw new Error(`stories/${slug}/story.json: ${msg}`);
};

/** Checks a story.json early and with a plain-English message, instead of failing mid-render. */
export const validateStory = (story: StorySpec): StorySpec => {
  const s = story.slug || '(no slug)';
  if (!story.slug || !/^[a-z0-9-]+$/.test(story.slug)) fail(s, '"slug" must be lower-case letters, numbers and dashes.');
  if (!story.hook) fail(s, '"hook" is missing: the question the reel opens with.');
  if (!(story.language in languages)) fail(s, `"language" must be one of: ${Object.keys(languages).join(', ')}.`);
  if (!(story.style in styles)) fail(s, `"style" must be one of: ${Object.keys(styles).join(', ')}.`);
  if (story.renderer === 'toon3d' && !(story.slug in videos3d)) fail(s, `"renderer": "toon3d" needs a 3D picture registered for this slug in src/videos/index.ts.`);
  if (!Array.isArray(story.scenes) || story.scenes.length === 0) fail(s, '"scenes" needs at least one scene.');
  story.scenes.forEach((scene) => {
    if (!(scene.backdrop?.palette in palettes)) fail(s, `scene "${scene.id}": palette must be one of: ${Object.keys(palettes).join(', ')}.`);
    (scene.cast ?? []).forEach((c) => {
      if (typeof c.look === 'string' && !(c.look in looks)) fail(s, `scene "${scene.id}": unknown look "${c.look}" (use ${Object.keys(looks).join(', ')}).`);
    });
  });
  return story;
};

/** Builds a registry entry from the two JSON files of a story. Empty timings count as "no voice-over yet". */
export const entry = (story: unknown, timings: unknown): StoryEntry => {
  const t = timings as TimingsFile;
  return {story: validateStory(story as StorySpec), timings: hasTimings(t) ? t : null};
};
