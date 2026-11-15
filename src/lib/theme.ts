export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

/**
 * Safe zone for Shorts / Reels / TikTok. App buttons and titles cover the top,
 * the bottom caption bar and the right-hand icon column, so key content stays inside.
 */
export const SAFE = {
  top: 220,
  bottom: 440,
  left: 80,
  right: 140,
} as const;

export const SAFE_RECT = {
  x: SAFE.left,
  y: SAFE.top,
  width: WIDTH - SAFE.left - SAFE.right,
  height: HEIGHT - SAFE.top - SAFE.bottom,
} as const;

export const mod = (n: number, m: number) => ((n % m) + m) % m;
