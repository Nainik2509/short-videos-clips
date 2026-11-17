import type {Reel} from '../toon3d/reel';
import {indiaVsAmerica} from './india-vs-america';

/**
 * 3D reels for stories that set `"renderer": "toon3d"` in story.json, by slug.
 * The story keeps its script, voice timings, captions and finish pipeline; only the picture comes from here
 * (played by src/toon3d/Reel3D.tsx).
 */
export const videos3d: Record<string, Reel> = {
  'india-vs-america-3-things': indiaVsAmerica,
};
