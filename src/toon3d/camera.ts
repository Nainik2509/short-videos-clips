// Camera moves for 3D shorts. A shot is "from" a pose "to" a pose, smootherstep between the two, so every shot
// is a continuous slow move (push-in, tilt, track). Everything is a pure function of the frame number.
import {lerp} from '../lib/math';

export type V3 = [number, number, number];
export type Move = {pos: V3; look: V3; fov?: number; roll?: number};
export type Cam = {pos: V3; look: V3; fov: number; roll: number};

export const DEFAULT_FOV = 40;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** smootherstep: symmetric ease in and out */
export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};

const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** the camera at progress u (0..1) of a shot that moves from `from` to `to` */
export const cameraAt = (from: Move, to: Move, u: number): Cam => {
  const k = glide(u);
  return {
    pos: lerp3(from.pos, to.pos, k),
    look: lerp3(from.look, to.look, k),
    fov: lerp(from.fov ?? DEFAULT_FOV, to.fov ?? DEFAULT_FOV, k),
    roll: lerp(from.roll ?? 0, to.roll ?? 0, k),
  };
};

/** a move that holds `pos` and drifts the look point: for "tilt down from a sign" style shots */
export const tilt = (pos: V3, lookA: V3, lookB: V3, fov = DEFAULT_FOV): [Move, Move] => [
  {pos, look: lookA, fov},
  {pos, look: lookB, fov},
];

/** a slow push toward `look`: ends at `k` times the start distance (k < 1 = closer) */
export const push = (pos: V3, look: V3, k: number, fov = DEFAULT_FOV, roll = 0): [Move, Move] => [
  {pos, look, fov, roll},
  {pos: lerp3(look, pos, k), look, fov, roll},
];
