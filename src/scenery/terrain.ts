import {mod} from '../lib/theme';

/** The world repeats every TILE pixels, so any scroll amount works. */
export const TILE = 2160;

type Wave = [cycles: number, amplitude: number, phase: number];
export type HillSpec = {base: number; waves: Wave[]; parallax: number};

/** 0 = back hills (slowest), 1 = middle, 2 = front hills (move 1:1 with the camera; characters walk on these). */
export const HILL_LAYERS: [HillSpec, HillSpec, HillSpec] = [
  {base: 1080, parallax: 0.15, waves: [[1, 90, 0.3], [3, 34, 1.2], [5, 14, 2.1]]},
  {base: 1240, parallax: 0.4, waves: [[2, 78, 1.7], [4, 30, 0.4], [7, 10, 3.0]]},
  {base: 1380, parallax: 1, waves: [[2, 52, 4.0], [3, 30, 2.2], [6, 10, 0.9]]},
];

/** Height (screen y) of a hill layer's surface at a position in that layer's own world space. */
export const hillY = (layer: 0 | 1 | 2, layerX: number): number => {
  const {base, waves} = HILL_LAYERS[layer];
  let y = base;
  for (const [cycles, amp, phase] of waves) y -= amp * Math.sin((2 * Math.PI * cycles * layerX) / TILE + phase);
  return y;
};

/** Where the front hill is under a screen x, for a camera scrolled by `scroll` pixels. */
export const groundY = (screenX: number, scroll: number): number => hillY(2, screenX + scroll * HILL_LAYERS[2].parallax);

/** Screen x of something fixed at `worldX` in a layer, wrapped so it loops forever. */
export const layerScreenX = (layer: 0 | 1 | 2, worldX: number, scroll: number, margin = 240): number =>
  mod(worldX - scroll * HILL_LAYERS[layer].parallax + margin, TILE) - margin;
