// The shot list of "The Last Over" (English and Hinglish share it: the scene ids are the same in both story.json files).
// A shot is a set, a light, a camera move and who/what is on screen at time t (see toon3d/reel.ts).
// Looking along +z, world +x is on the LEFT of the picture. Every number on a tag is in script.md under "Sources and fact check".
import {clamp01} from "../../toon3d/camera";
import {badge, fx, tag, type Effect, type Shot} from "../../toon3d/reel";
import type {Who} from "./cast";
import {batIcon, confettiIcon, cricketBallIcon, footballIcon, storyDots, ticketIcon, trophyIcon} from "./icons";
import {SIDE, type SetName} from "./sets";

const MARIGOLD = "#ffc93c";
const RED = "#e8344a";
const PAPER = "#fffaf2";

/** height of the pop-in labels on the picture (-1..1), just under the story bar */
const TAG_Y = 0.46;

const COLORS = ["#ffc93c", "#e8344a", "#2ec4b6", "#7a4fd6", "#fffaf2", "#ff8a1f"];
const confetti = COLORS.map(confettiIcon);

/** the story bar: n of 5 dots filled, pinned under the top safe area (not shown in the opening scene) */
const dots = (n: number): Effect => badge(`dots-${n}`, storyDots(n), -1, 0, 0.7, 0.62);

/** `count` pieces of confetti falling over a rectangle of the set */
const confettiFall = (t: number, cx: number, z: number, count = 14, spread = 6): Effect[] =>
  Array.from({length: count}, (_, i) => {
    const u = (t * 0.35 + i / count) % 1;
    const x = cx + ((i * 37) % 11 - 5) * (spread / 5);
    return fx(`confetti-${i % 6}`, confetti[i % 6], x, 7 - u * 7, z + (i % 4) * 0.6, 0.26);
  });

const ball = (x: number, y: number, z: number, w = 0.45, at = 0): Effect => fx("ball", cricketBallIcon, x, y, z, w, at);

/** the gold cup used in effects */
const goldCup = trophyIcon();

const bat = (x: number, y: number, z: number, w = 1.1, at = 0): Effect => fx("bat", batIcon, x, y, z, w, at);

/** the cover: Dhoni (a stick figure labelled in the caption, no real likeness) at the crease at golden hour */
export const COVER: Shot<SetName, Who> = {
  id: "cover", scene: "cover", at: 0, set: "stadiumBlue", light: "golden", cInf: 6,
  from: {pos: [-1.6, 1.4, -5], look: [0, 1.7, 8], fov: 44},
  to: {pos: [-1.6, 1.4, -5], look: [0, 1.7, 8], fov: 44},
  people: () => [{who: "dhoni", x: 0.2, z: 1.4, mood: "smile"}],
  effects: () => [bat(-1.1, 1.1, 1.3, 1.3), ball(1.8, 2.1, 2.5, 0.5)],
};

export const SHOTS: Shot<SetName, Who>[] = [
  // ---- hook: a lone figure at the crease, golden hour ----
  {
    id: "hook-wide", scene: "hook", at: 0, set: "stadiumBlue", light: "golden", cInf: 0,
    from: {pos: [-3.5, 2.4, -13], look: [0, 2.2, 6], fov: 60},
    to: {pos: [-1.2, 1.9, -8.5], look: [0, 2, 6], fov: 52},
    people: () => [{who: "dhoni", x: 0, z: 1.5, mood: "smile"}],
    effects: () => [bat(-1, 1.1, 1.4, 1.2), tag("STAY TILL THE END", 0.4, MARIGOLD, -0.02)],
  },
  {
    id: "hook-close", scene: "hook", at: 2.7, set: "stadiumBlue", light: "golden", cInf: 8,
    from: {pos: [0.9, 0.9, -4.2], look: [0, 1.7, 2], fov: 46},
    to: {pos: [0.5, 1.2, -3], look: [0, 1.8, 2], fov: 40},
    people: () => [{who: "dhoni", x: 0, z: 1.8, mood: "neutral"}],
    effects: (t) => [bat(-0.9, 1.1, 1.7, 1.2), ball(1.4, 1.6 + Math.sin(t * 3) * 0.05, 2.4, 0.4, 0.3), tag("Ranchi to the last over", 0.4, PAPER, -0.02)],
  },
  {
    id: "hook-crane", scene: "hook", at: 4.8, set: "stadiumBlue", light: "golden", cInf: 0,
    from: {pos: [0, 16, -12], look: [0, 0, 8], fov: 58},
    to: {pos: [0, 9, -5], look: [0, 0.5, 6], fov: 52},
    people: () => [{who: "dhoni", x: 0, z: 1.5, mood: "smile"}],
    effects: () => [tag("The last over", 0.3, MARIGOLD, -0.02)],
  },

  // ---- ranchi: a boy in goal ----
  {
    id: "ranchi-wide", scene: "ranchi", at: 0, set: "ranchi", light: "warm", cInf: 0,
    from: {pos: [3.4, 2.4, -7], look: [0, 1.4, 7], fov: 56},
    to: {pos: [1.4, 1.8, -4], look: [0, 1.4, 7], fov: 50},
    people: () => [
      {who: "boy", x: 0, z: 6.2, scale: 0.62, mood: "grin", pose: "cheer"},
      {who: "friendA", x: 2.6, z: 2.2, mood: "grin", pose: "point", face: -1},
      {who: "friendB", x: -2.8, z: 3, mood: "smile"},
    ],
    effects: () => [dots(1), tag("Ranchi, 1981", 0.3, MARIGOLD, TAG_Y), fx("football", footballIcon, 1.4, 0.55, 3.6, 0.6)],
  },
  {
    id: "ranchi-goal", scene: "ranchi", at: 1.9, set: "ranchi", light: "warm", cInf: 8,
    from: {pos: [0.6, 1.0, -0.6], look: [0, 1.1, 7], fov: 42},
    to: {pos: [0.3, 1.0, 1.4], look: [0, 1.1, 7], fov: 38},
    people: () => [{who: "boy", x: 0, z: 6.3, scale: 0.62, mood: "grin", pose: "cheer"}],
    effects: (t) => {
      const u = clamp01(t / 1.1);
      return [dots(1), fx("football", footballIcon, 1.6 - u * 1.4, 0.5 + Math.sin(u * Math.PI) * 1.2, 3.2 + u * 2.6, 0.55)];
    },
  },
  {
    id: "ranchi-bat", scene: "ranchi", at: 3.7, set: "ranchi", light: "warm", cInf: 8,
    from: {pos: [-1.8, 0.9, -2.2], look: [0, 1.1, 5], fov: 46},
    to: {pos: [-0.8, 1.0, -0.4], look: [0, 1.2, 5], fov: 42},
    people: () => [{who: "boy", x: 0, z: 5.6, scale: 0.7, mood: "shock", pose: "shrug"}],
    effects: () => [dots(1), bat(-1.5, 1.5, 5.2, 1.5, 0.3), tag("Sixes? Not on the list", 0.6, PAPER, TAG_Y)],
  },

  // ---- train: ticket examiner at Kharagpur ----
  {
    id: "train-wide", scene: "train", at: 0, set: "station", light: "cool", cInf: 0,
    from: {pos: [-9, 2.4, -10], look: [1, 1.6, 6], fov: 56},
    to: {pos: [-4.5, 2, -6.5], look: [1, 1.6, 6], fov: 50},
    people: () => [
      {who: "examiner", x: 1, z: 0.8, mood: "smile"},
      {who: "traveller", x: -2, z: 1.4, mood: "neutral", face: -1},
    ],
    effects: () => [dots(2), tag("Kharagpur, 2001–03", 0.3, MARIGOLD, TAG_Y), fx("ticket", ticketIcon, 1.9, 2.9, 0.8, 0.9, 0.9)],
  },
  {
    id: "train-ticket", scene: "train", at: 2.2, set: "station", light: "cool", cInf: 8,
    from: {pos: [1.8, 1.5, -3.4], look: [0.4, 1.5, 1], fov: 46},
    to: {pos: [1.2, 1.5, -2.3], look: [0.4, 1.5, 1], fov: 40},
    people: () => [
      {who: "examiner", x: 0.7, z: 1.1, mood: "smile", pose: "hold", held: "card"},
      {who: "traveller", x: -0.9, z: 1.5, mood: "worry", face: -1},
    ],
    effects: (t) => [dots(2), fx("ticket", ticketIcon, -0.1, 1.6 + Math.sin(t * 2) * 0.06, 0.6, 0.8)],
  },
  {
    id: "train-dream", scene: "train", at: 3.8, set: "station", light: "golden", cInf: 6,
    from: {pos: [3, 1.3, -5.5], look: [0, 2, 1.6], fov: 52},
    to: {pos: [1.6, 1.5, -3.6], look: [0, 2.2, 1.6], fov: 46},
    people: () => [{who: "examiner", x: 0, z: 1.6, mood: "smile"}],
    effects: () => [dots(2), bat(-1.3, 3.1, 1.6, 1.2, 0.2), ball(-0.1, 3.3, 1.6, 0.42, 0.5), tag("Dream on the side", 0.7, PAPER, TAG_Y)],
  },

  // ---- t20: 2007 ----
  {
    id: "t20-podium", scene: "t20", at: 0, set: "hall", light: "warm", cInf: 0,
    from: {pos: [0, 1.5, -3], look: [0, 2.6, 6], fov: 56},
    to: {pos: [0, 1.7, -0.6], look: [0, 2.8, 6], fov: 50},
    people: () => [
      {who: "dhoni", x: 0, z: 3.6, mood: "grin", pose: "cheer"},
      {who: "mateA", x: 1.9, z: 3.8, mood: "laugh", pose: "cheer"},
      {who: "mateB", x: -1.9, z: 3.8, mood: "laugh", pose: "cheer"},
    ],
    effects: (t) => [dots(3), ...confettiFall(t, 0, 6.5, 14, 8)],
  },
  {
    id: "t20-cup", scene: "t20", at: 1.8, set: "hall", light: "warm", cInf: 8,
    from: {pos: [0.5, 2.3, -1.2], look: [0, 2.5, 6], fov: 42},
    to: {pos: [0.2, 2.5, 0.4], look: [0, 2.6, 6], fov: 38},
    people: () => [{who: "dhoni", x: 1.1, z: 3.9, mood: "laugh", pose: "cheer"}],
    effects: (t) => [dots(3), ...confettiFall(t, 0, 7, 10, 3)],
  },

  // ---- loop: the calendar flips, a figure walks to the crease ----
  {
    id: "loop-years", scene: "loop", at: 0, set: "stadiumBlue", light: "golden", cInf: 6,
    from: {pos: [0, 1.2, -5.5], look: [0, 0.8, 2], fov: 50},
    to: {pos: [0, 1.0, -3.2], look: [0, 0.8, 2], fov: 42},
    people: () => [],
    effects: (t) => [dots(3), t < 1.7 ? tag("2007", 0.05, PAPER, 0.3) : tag("2011", 0.0, MARIGOLD, 0.3)],
  },
  {
    id: "loop-walk", scene: "loop", at: 2.0, set: "stadiumBlue", light: "golden", cInf: 6,
    from: {pos: [-0.8, 1.5, -6.5], look: [0, 1.4, 8], fov: 46},
    to: {pos: [-0.4, 1.4, -4.5], look: [0, 1.4, 8], fov: 42},
    people: (t) => [{who: "dhoni", x: 0, z: 13 - Math.min(t, 1.6) * 3.2, mood: "neutral", pose: "walk"}],
    effects: () => [dots(3), tag("2011", 0.0, MARIGOLD, 0.3)],
  },

  // ---- final: the 2011 World Cup final ----
  {
    id: "final-arrive", scene: "final", at: 0, set: "stadiumBlue", light: "golden", cInf: 0,
    from: {pos: [-4, 2.6, -12], look: [0, 2, 8], fov: 56},
    to: {pos: [-1.5, 2, -8], look: [0, 1.8, 8], fov: 48},
    people: (t) => [
      {who: "dhoni", x: 0, z: 9.5 - Math.min(t, 1.8) * 3.7, mood: "neutral", pose: "walk"},
      {who: "rival", x: 0.3, z: 13.4, mood: "neutral", face: -1},
    ],
    effects: () => [dots(4), tag("Wankhede, 2 April 2011", 0.3, MARIGOLD, TAG_Y)],
  },
  {
    id: "final-ninety-one", scene: "final", at: 2.3, set: "stadiumBlue", light: "golden", cInf: 8,
    from: {pos: [-2.2, 1.5, -3.6], look: [-0.1, 1.5, 1.2], fov: 46},
    to: {pos: [-1.6, 1.5, -2.2], look: [-0.1, 1.5, 1.2], fov: 42},
    people: () => [{who: "dhoni", x: 0, z: 1.2, mood: "neutral", pose: "hold"}],
    effects: (t) => [dots(4), bat(-0.9, 1.1, 0.9, 1.0), ball(0.6, 1.2, 12 - clamp01(t / 1.2) * 10.6, 0.4 + clamp01(t / 1.2) * 0.2), tag("91 not out", 0.5, PAPER, TAG_Y)],
  },
  {
    id: "final-six", scene: "final", at: 3.8, set: "stadiumBlue", light: "golden", cInf: 6,
    from: {pos: [1.8, 1.3, -3.4], look: [0, 3, 14], fov: 50},
    to: {pos: [0.8, 2.6, -2.2], look: [0, 5, 22], fov: 46},
    people: () => [{who: "dhoni", x: 0, z: 1.2, mood: "laugh", pose: "cheer"}],
    effects: (t) => {
      const u = clamp01(t / 1.7);
      return [dots(4), ball(-2 * u, 1.3 + 9 * Math.sin(u * Math.PI * 0.62), 1.2 + u * 46, 0.5 + u * 3), tag("SIX!", 0.25, RED, TAG_Y)];
    },
  },
  {
    id: "final-crowd", scene: "final", at: 5.5, set: "stadiumBlue", light: "golden", cInf: 7,
    from: {pos: [0, 1.3, -2.6], look: [0, 2, 4], fov: 54},
    to: {pos: [0, 1.6, -1.6], look: [0, 2.3, 4], fov: 48},
    people: () => [
      {who: "fanBlue", x: 2.4, z: 2.1, mood: "relief", pose: "cheer"},
      {who: "fanBlue2", x: -2.2, z: 2.5, mood: "laugh", pose: "cheer"},
      {who: "mateA", x: 0.4, z: 3.4, mood: "laugh", pose: "cheer"},
    ],
    effects: (t) => [dots(4), tag("A billion exhaled", 0.4, PAPER, TAG_Y), ...confettiFall(t, 0, 3.5, 16, 7)],
  },

  // ---- champions: after twenty-eight years ----
  {
    id: "champions-team", scene: "champions", at: 0, set: "stadiumBlue", light: "golden", cInf: 4,
    from: {pos: [-2, 1.5, -6], look: [0, 2.1, 3], fov: 52},
    to: {pos: [-1, 1.7, -4.2], look: [0, 2.3, 3], fov: 46},
    people: () => [
      {who: "dhoni", x: 0, z: 2.6, mood: "laugh", pose: "cheer"},
      {who: "mateA", x: 2.2, z: 2.9, mood: "laugh", pose: "cheer"},
      {who: "mateB", x: -2.1, z: 3, mood: "laugh", pose: "cheer"},
    ],
    effects: (t) => [dots(4), fx("cup", goldCup, 0, 3.7, 2.6, 1.1, 0.2), ...confettiFall(t, 0, 3.5, 16, 7)],
  },
  {
    id: "champions-28", scene: "champions", at: 1.6, set: "stadiumBlue", light: "golden", cInf: 6,
    from: {pos: [0.2, 2.6, -5], look: [0, 3.4, 3], fov: 46},
    to: {pos: [0, 2.8, -3.6], look: [0, 3.6, 3], fov: 42},
    people: () => [{who: "dhoni", x: 0, z: 2.6, mood: "laugh", pose: "cheer"}],
    effects: (t) => [dots(4), fx("cup", goldCup, 0, 3.9, 2.6, 1.0, 0), tag("28 years", 0.2, MARIGOLD, TAG_Y), ...confettiFall(t, 0, 3, 10, 4)],
  },

  // ---- three: three trophies on a shelf ----
  {
    id: "three-2013", scene: "three", at: 0, set: "hall", light: "warm", cInf: 8,
    from: {pos: [SIDE - 5.4, 3.2, -1.2], look: [SIDE - 5.4, 3.5, 8.6], fov: 40},
    to: {pos: [SIDE - 5.4, 3.3, 0.6], look: [SIDE - 5.4, 3.6, 8.6], fov: 34},
    people: () => [],
    effects: () => [dots(4), tag("2013 Champions Trophy", 0.2, MARIGOLD, TAG_Y)],
  },
  {
    id: "three-2011", scene: "three", at: 1.8, set: "hall", light: "warm", cInf: 8,
    from: {pos: [SIDE, 3.4, -1.2], look: [SIDE, 3.8, 8.6], fov: 40},
    to: {pos: [SIDE, 3.5, 0.6], look: [SIDE, 3.9, 8.6], fov: 34},
    people: () => [],
    effects: () => [dots(4), tag("2011 World Cup", 0.2, MARIGOLD, TAG_Y)],
  },
  {
    id: "three-2007", scene: "three", at: 3.3, set: "hall", light: "warm", cInf: 8,
    from: {pos: [SIDE + 5.4, 3.2, -1.2], look: [SIDE + 5.4, 3.5, 8.6], fov: 40},
    to: {pos: [SIDE + 5.4, 3.3, 0.6], look: [SIDE + 5.4, 3.6, 8.6], fov: 34},
    people: () => [],
    effects: () => [dots(4), tag("2007 T20 World Cup", 0.2, MARIGOLD, TAG_Y)],
  },
  {
    id: "three-only", scene: "three", at: 4.7, set: "hall", light: "warm", cInf: 0,
    from: {pos: [SIDE + 1, 3.4, -11], look: [SIDE, 3.4, 8], fov: 58},
    to: {pos: [SIDE + 0.6, 3.2, -8.5], look: [SIDE, 3.4, 8], fov: 52},
    people: () => [{who: "dhoni", x: SIDE, z: -2.2, mood: "grin", pose: "point"}],
    effects: () => [dots(4), tag("The ONLY captain with all 3", 0.3, PAPER, TAG_Y)],
  },

  // ---- csk: the yellow army ----
  {
    id: "csk-wide", scene: "csk", at: 0, set: "stadiumYellow", light: "warm", cInf: 0,
    from: {pos: [-3.5, 2.6, -10], look: [0, 3, 12], fov: 58},
    to: {pos: [-1.5, 2.1, -6.5], look: [0, 2.8, 12], fov: 50},
    people: () => [
      {who: "dhoniYellow", x: 0, z: 2, mood: "smile"},
      {who: "fanYellow", x: 3.1, z: 3.2, mood: "laugh", pose: "cheer"},
      {who: "fanYellow2", x: -3, z: 3.6, mood: "grin", pose: "cheer"},
    ],
    effects: () => [dots(4), tag("Chennai Super Kings", 0.3, MARIGOLD, TAG_Y)],
  },
  {
    id: "csk-five", scene: "csk", at: 1.8, set: "stadiumYellow", light: "warm", cInf: 6,
    from: {pos: [0, 1.7, -5], look: [0, 2.7, 3], fov: 54},
    to: {pos: [0, 1.9, -3.6], look: [0, 2.9, 3], fov: 48},
    people: () => [{who: "dhoniYellow", x: 0, z: 2.2, mood: "grin", pose: "cheer"}],
    effects: () => [
      dots(4),
      ...[2.4, 1.2, 0, -1.2, -2.4].map((x, i) => fx(`trophy-${i}`, goldCup, x, 3.7, 2.4, 0.9, 0.25 + i * 0.28)),
      tag("5 IPL titles", 0.3, MARIGOLD, TAG_Y),
    ],
  },
  {
    id: "csk-cool", scene: "csk", at: 3.6, set: "stadiumYellow", light: "warm", cInf: 8,
    from: {pos: [0.3, 1.9, -1.8], look: [0, 2.1, 2], fov: 42},
    to: {pos: [0.1, 2, -0.8], look: [0, 2.1, 2], fov: 36},
    people: () => [{who: "dhoniYellow", x: 0, z: 2.2, mood: "neutral"}],
    effects: () => [dots(4), tag("Captain Cool", 0.2, MARIGOLD, TAG_Y)],
  },

  // ---- retire: the bat laid down ----
  {
    id: "retire-bat", scene: "retire", at: 0, set: "stadiumYellow", light: "golden", cInf: 6,
    from: {pos: [SIDE + 3, 8.5, -9.6], look: [SIDE + 3, 0, -7.9], fov: 44},
    to: {pos: [SIDE + 3, 5.6, -9.2], look: [SIDE + 3, 0, -7.9], fov: 40},
    people: () => [],
    effects: () => [dots(5), tag("17 Nov 2026", 0.2, MARIGOLD, TAG_Y)],
  },
  {
    id: "retire-wave", scene: "retire", at: 1.5, set: "stadiumYellow", light: "golden", cInf: 0,
    from: {pos: [0, 2.2, -6], look: [0, 1.6, 6], fov: 50},
    to: {pos: [0, 6.5, -15], look: [0, 1.4, 6], fov: 52},
    people: () => [{who: "dhoniYellow", x: 0, z: 3.6, mood: "smile", pose: "wave"}],
    effects: () => [dots(5), tag("After 18 years", 0.3, PAPER, TAG_Y)],
  },

  // ---- mentor: not leaving ----
  {
    id: "mentor-bench", scene: "mentor", at: 0, set: "stadiumYellow", light: "golden", cInf: 4,
    from: {pos: [SIDE + 1, 1.9, -7], look: [SIDE, 1.5, 3.4], fov: 54},
    to: {pos: [SIDE + 0.4, 1.8, -5], look: [SIDE, 1.5, 3.4], fov: 48},
    people: () => [
      {who: "dhoniYellow", x: SIDE, z: 2.8, mood: "smile", pose: "point"},
      {who: "youngA", x: SIDE + 2, z: 3.2, mood: "grin", face: -1},
      {who: "youngB", x: SIDE - 2, z: 3.4, mood: "smile"},
    ],
    effects: () => [dots(5), tag("Team Mentor, IPL 2027", 0.4, MARIGOLD, TAG_Y)],
  },
  {
    id: "mentor-close", scene: "mentor", at: 2.4, set: "stadiumYellow", light: "golden", cInf: 7,
    from: {pos: [SIDE + 0.2, 1.7, -3.2], look: [SIDE - 0.4, 1.9, 3], fov: 50},
    to: {pos: [SIDE - 0.1, 1.8, -2], look: [SIDE - 0.4, 1.9, 3], fov: 44},
    people: () => [
      {who: "dhoniYellow", x: SIDE + 0.5, z: 2.6, mood: "grin", pose: "hold", held: "card"},
      {who: "youngA", x: SIDE - 1.3, z: 2.8, mood: "laugh", pose: "cheer", face: -1},
    ],
    effects: () => [dots(5), ball(SIDE - 0.2, 2.9, 2.6, 0.4, 0.3)],
  },

  // ---- answer: calm ----
  {
    id: "answer-ask", scene: "answer", at: 0, set: "stadiumBlue", light: "golden", cInf: 4,
    from: {pos: [0, 1.6, -5.5], look: [0, 1.6, 3], fov: 54},
    to: {pos: [0, 1.6, -4], look: [0, 1.6, 3], fov: 48},
    people: () => [
      {who: "sticky", x: -1.1, z: 0.4, mood: "grin", pose: "shrug"},
      {who: "dhoni", x: 1.4, z: 2.4, mood: "neutral"},
    ],
    effects: () => [dots(5)],
  },
  {
    id: "answer-calm", scene: "answer", at: 1.7, set: "stadiumBlue", light: "golden", cInf: 5,
    from: {pos: [0, 1.5, -5], look: [0, 1.8, 3], fov: 54},
    to: {pos: [0, 1.7, -3.6], look: [0, 1.9, 3], fov: 46},
    people: () => [
      {who: "dhoni", x: 0, z: 3, mood: "neutral"},
      {who: "fanBlue", x: 2.5, z: 1.4, mood: "worry", pose: "cheer"},
      {who: "fanBlue2", x: -2.4, z: 1.7, mood: "shock", pose: "wave"},
      {who: "mateB", x: 1.2, z: 1.2, mood: "worry"},
    ],
    effects: () => [dots(5), tag("Everyone else panics…", 0.2, PAPER, TAG_Y)],
  },
  {
    id: "answer-matches", scene: "answer", at: 4.0, set: "stadiumBlue", light: "golden", cInf: 6,
    from: {pos: [0.6, 1.7, -3.4], look: [0, 2.2, 2.4], fov: 46},
    to: {pos: [0.3, 1.9, -2.4], look: [0, 2.3, 2.4], fov: 40},
    people: () => [{who: "dhoni", x: 0, z: 2.4, mood: "smile", pose: "hold"}],
    effects: () => [dots(5), fx("cup", goldCup, 1.3, 3.2, 2.4, 1.1, 0.2), tag("Some finish matches", 0.3, PAPER, TAG_Y)],
  },
  {
    id: "answer-doubts", scene: "answer", at: 5.5, set: "stadiumBlue", light: "golden", cInf: 8,
    from: {pos: [0.2, 1.8, -2.2], look: [0, 2, 2.2], fov: 40},
    to: {pos: [0.1, 1.9, -1.2], look: [0, 2.05, 2.2], fov: 34},
    people: () => [{who: "dhoni", x: 0, z: 2.4, mood: "relief"}],
    effects: () => [dots(5), tag("He finished doubts", 0.3, MARIGOLD, TAG_Y)],
  },

  // ---- next: the scale reveal ----
  {
    id: "next-sticky", scene: "next", at: 0, set: "stadiumBlue", light: "golden", cInf: 5,
    from: {pos: [0.3, 1.4, -4.6], look: [0, 1.5, 1.2], fov: 46},
    to: {pos: [0.2, 1.5, -3.6], look: [0, 1.6, 1.2], fov: 42},
    people: () => [{who: "sticky", x: 0, z: 0.8, mood: "laugh", pose: "wave"}],
    effects: () => [dots(5), tag("Next: 2 April 2011", 0.3, MARIGOLD, TAG_Y)],
  },
  {
    id: "next-reveal", scene: "next", at: 2.2, set: "stadiumBlue", light: "golden", cInf: 0,
    from: {pos: [0, 2, -6], look: [0, 3, 14], fov: 54},
    to: {pos: [0, 46, -66], look: [0, 8, 16], fov: 66},
    people: () => [{who: "dhoni", x: 0, z: 1.5, mood: "smile"}],
    effects: () => [dots(5)],
  },
];
