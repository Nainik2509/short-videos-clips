import {spring} from 'remotion';

/** Shared by every stage prop (src/scenery/Stage*.tsx): the outline colour and the pop-in animation. */
export const INK = '#111111';

/** Pop-in animation: `s` goes 0 -> 1 with a small bounce, `at` is seconds into the scene when the item appears. */
export const pop = (frame: number, fps: number, at = 0) => {
  const s = spring({frame: frame - Math.round(at * fps), fps, config: {damping: 12, stiffness: 160}, durationInFrames: 18});
  return {s, visible: frame >= Math.round(at * fps)};
};
