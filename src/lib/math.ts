// Small numeric helpers shared by the rig and the 3D toon code (one copy, so they cannot drift apart).

/** Degrees to radians. */
export const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** Linear blend: `t` = 0 gives `a`, `t` = 1 gives `b`. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Limits `x` to the range `min`..`max`. */
export const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
