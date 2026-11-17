// The shot list of "5 Things India Is #1 In": two to four shots per scene (see toon3d/reel.ts).
// Scene ids match stories/india-number-one-5-things/story.json. Tag times follow the spoken word they show.
// Every number on a tag is in the story's script.md under "Sources and fact check".
import type {Move} from "../../toon3d/camera";
import {chiliIcon, clapperIcon, coinIcon, cowIcon, envelopeIcon, milkCanIcon, onDisc, towerIcon} from "../../toon3d/icons";
import {badge, fx, tag, type Effect, type Person, type Shot} from "../../toon3d/reel";
import type {Who} from "./cast";
import {SIDE, SPOTS, type SetName} from "./sets";

type People = Person<Who>[];

const GREEN = "#3ddc84";
const SKY = "#9ad8ff";
const SAFFRON = "#ff8a1f";
const TEAL = "#2ec4b6";

const {farm: FARM, post: POST, lake: LAKE, cinema: CINEMA, mumbai: MUMBAI} = SPOTS;
/** the film set and the marquee tower are the cinema set's second and third stage */
const SET_X = SIDE;
const TOWER_X = CINEMA.towerX;

/** every chapter opens looking up at its hanging number, then settles on the place */
const numberViewAt = (x: number): Move => ({pos: [x + 0.4, 1.5, -7.5], look: [x, SPOTS.board.y, SPOTS.board.z], fov: 60});
const numberView = numberViewAt(0);

/** `count` copies of an icon looping along a path; `u` runs 0..1 along it, staggered per copy */
const stream = (id: string, count: number, t: number, speed: number, place: (u: number, i: number) => Effect): Effect[] =>
  Array.from({length: count}, (_, i) => place((t * speed + i / count) % 1, i)).map((e) => ({...e, id}));

const cows: Effect[] = [
  fx("cow", cowIcon, 2.9, 1, 4, 2.4),
  fx("cow", cowIcon, -2.7, 1, 4.6, 2.4),
];

const plazaFans: People = [
  {who: "fanA", x: 4.4, z: 2.4, mood: "grin", pose: "cheer"},
  {who: "fanB", x: -3.6, z: 3, mood: "smile", face: -1},
  {who: "fanC", x: -5.2, z: 1.2, mood: "grin", pose: "wave", face: -1},
];

/** the household staff lined up at the door: three rows of six */
const staff: People = Array.from({length: 18}, (_, i): Person<Who> => {
  const row = Math.floor(i / 6);
  const col = i % 6;
  return {
    who: (["staffA", "staffB", "staffC"] as const)[(i + row) % 3],
    x: (col - 2.5) * 1.15 + (row % 2) * 0.5, z: 5 + row * 1.5, mood: i % 4 === 0 ? "grin" : "smile", face: col < 3 ? 1 : -1,
  };
});

/** the five chapter icons in a row, popping in one by one */
const chapterIcons = [milkCanIcon, envelopeIcon, chiliIcon, clapperIcon, towerIcon].map((icon, i) =>
  badge(`chapter-icon-${i}`, onDisc(icon), 0.5 + i * 0.14, (i - 2) * 0.32, 0.34, 0.15),
);

/** the cover: Sticky and friends cheering under the "#1" board, which finishes the title "5 THINGS INDIA IS" */
export const COVER: Shot<SetName, Who> = {
  id: "cover", scene: "cover", at: 0, set: "plaza", light: "warm", cInf: 6,
  from: {pos: [0.9, 1.3, -6.2], look: [1.3, 3.8, 3.4], fov: 50},
  to: {pos: [0.9, 1.3, -6.2], look: [1.3, 3.8, 3.4], fov: 50},
  people: () => [
    {who: "sticky", x: 0.3, z: 1.2, mood: "laugh", pose: "cheer"},
    {who: "fanA", x: 3, z: 2.4, mood: "grin", pose: "cheer"},
    {who: "fanB", x: -1.2, z: 2.6, mood: "grin", pose: "wave", face: -1},
  ],
};

export const SHOTS: Shot<SetName, Who>[] = [
  // ---- hook: the "#1" plaza ----
  {
    id: "hook-plaza", scene: "hook", at: 0, set: "plaza", light: "warm", cInf: 0,
    from: {pos: [-2.5, 2.2, -9], look: [0.8, 2.4, 2], fov: 56},
    to: {pos: [-1.2, 1.9, -6], look: [0.8, 2.3, 2], fov: 50},
    people: () => [{who: "sticky", x: -0.6, z: 0.6, mood: "grin", pose: "wave"}, ...plazaFans],
  },
  {
    id: "hook-sticky", scene: "hook", at: 2.6, set: "plaza", light: "warm", cInf: 8,
    from: {pos: [-0.2, 1.6, -4.4], look: [-0.5, 1.5, 0.6], fov: 44},
    to: {pos: [-0.3, 1.6, -3.8], look: [-0.5, 1.5, 0.6], fov: 42},
    people: () => [{who: "sticky", x: -0.6, z: 0.6, mood: "laugh", pose: "cheer"}],
  },
  // ---- 1. milk ----
  {
    id: "milk-farm", scene: "milk", at: 0, set: "farm", light: "day", cInf: 0,
    from: numberView,
    to: {pos: [0.4, 1.7, -6.5], look: [0.2, 1.6, 1.5], fov: 50},
    people: () => [
      {who: "farmer", x: 0.9, z: 1, mood: "smile"},
      {who: "sticky", x: -0.6, z: 0.7, mood: "smile"},
    ],
    effects: () => cows,
  },
  {
    id: "milk-cans", scene: "milk", at: 2.2, set: "farm", light: "day", cInf: 8,
    from: {pos: [0.6, 1.6, -5], look: [0.2, 1.6, 1], fov: 50},
    to: {pos: [0.4, 1.6, -4.2], look: [0.2, 1.6, 1], fov: 48},
    people: () => [
      {who: "farmer", x: 0.9, z: 1, mood: "grin", pose: "point"},
      {who: "sticky", x: -0.6, z: 0.7, mood: "grin", pose: "hold", held: "cup"},
    ],
    effects: () => [...cows, tag("~24% of world milk", 0.2)],
  },
  {
    id: "milk-stacks", scene: "milk-eu", at: 0, set: "farm", light: "day", cInf: 0,
    from: {pos: [SIDE, 2.6, -10], look: [SIDE, 2.5, FARM.stackZ], fov: 50},
    to: {pos: [SIDE, 2.2, -8.5], look: [SIDE, 2.5, FARM.stackZ], fov: 50},
    people: () => [{who: "sticky", x: SIDE, z: -0.8, mood: "grin", pose: "shrug"}],
    effects: () => [tag("More than the whole EU", 1.1, GREEN)],
  },
  {
    id: "milk-india-stack", scene: "milk-eu", at: 2.2, set: "farm", light: "day", cInf: 6,
    from: {pos: [SIDE + 2.8, 0.8, -3.4], look: [SIDE + FARM.stackGap, 2, FARM.stackZ], fov: 48},
    to: {pos: [SIDE + 2.4, 0.7, -2.6], look: [SIDE + FARM.stackGap, 2.5, FARM.stackZ], fov: 48},
    people: () => [{who: "sticky", x: SIDE + 0.9, z: 1.6, mood: "laugh", pose: "cheer"}],
  },
  // ---- 2. post offices ----
  {
    id: "post-office", scene: "post", at: 0, set: "post", light: "warm", cInf: 0,
    from: numberView,
    to: {pos: [0.8, 1.7, -6], look: [0.3, 2.2, 3], fov: 50},
    people: () => [
      {who: "sticky", x: 0.5, z: 1, mood: "smile"},
      {who: "postman", x: -1.2, z: 1.6, mood: "smile", face: -1},
    ],
  },
  {
    id: "post-letters", scene: "post", at: 2, set: "post", light: "warm", cInf: 8,
    from: {pos: [0.6, 1.6, -4.4], look: [0.9, 1.5, 1.1], fov: 48},
    to: {pos: [0.7, 1.6, -3.6], look: [0.9, 1.5, 1.1], fov: 46},
    people: () => [
      {who: "sticky", x: 0.3, z: 1, mood: "grin", pose: "point", face: -1},
      {who: "postman", x: 2.9, z: 1.8, mood: "grin", pose: "wave"},
    ],
    // letters fly from Sticky's hand into the letter box
    effects: (t) => [
      ...stream("letter", 3, t, 0.6, (u) => fx("letter", envelopeIcon, 0.8 + u * (POST.boxX - 0.8), 1.7 + Math.sin(u * Math.PI) * 0.8 - u * 0.4, POST.boxZ - 0.1, 0.42)),
      tag("165,000 post offices", 0.1),
    ],
  },
  {
    id: "post-network", scene: "post", at: 4.6, set: "post", light: "warm", cInf: 0,
    from: {pos: [SIDE, 3, -3.5], look: [SIDE, 1, 9], fov: 56},
    to: {pos: [SIDE, 5.2, -1.5], look: [SIDE, 0.8, 12], fov: 56},
    people: () => [],
    effects: () => [tag("World's largest postal network", 0.3, SAFFRON)],
  },
  {
    id: "lake-wide", scene: "post-lake", at: 0, set: "lake", light: "day", cInf: 0,
    from: {pos: [-1.6, 3, -14], look: [-0.6, 1.9, LAKE.boatZ], fov: 60},
    to: {pos: [-1.2, 2.5, -11.5], look: [-0.6, 1.9, LAKE.boatZ], fov: 58},
    people: () => [
      {who: "postman", x: 1.7, y: LAKE.deckY, z: LAKE.deckZ, mood: "grin", pose: "wave"},
      {who: "sticky", x: LAKE.shikara.x, y: LAKE.shikara.y, z: LAKE.shikara.z, mood: "grin", pose: "wave", face: -1},
    ],
    effects: () => [tag("Dal Lake, Kashmir", 1.4, SKY)],
  },
  {
    id: "lake-deck", scene: "post-lake", at: 2.1, set: "lake", light: "day", cInf: 8,
    from: {pos: [0.6, 2.2, -3.4], look: [1.4, 2, LAKE.deckZ], fov: 44},
    to: {pos: [0.9, 2.2, -2.6], look: [1.4, 2, LAKE.deckZ], fov: 40},
    people: () => [{who: "postman", x: 1.7, y: LAKE.deckY, z: LAKE.deckZ, mood: "laugh", pose: "hold", held: "receipt"}],
    effects: () => [fx("letter", envelopeIcon, 0.5, 2.9, LAKE.deckZ - 0.2, 0.5, 0.3)],
  },
  // ---- 3. spices ----
  {
    id: "spice-stall", scene: "spice", at: 0, set: "spice", light: "warm", cInf: 0,
    from: numberView,
    to: {pos: [0.2, 1.9, -6], look: [-0.2, 1.5, 2.4], fov: 52},
    people: () => [
      {who: "spiceSeller", x: 0.6, z: SPOTS.spice.keeperZ, mood: "grin"},
      {who: "sticky", x: -1.5, z: 1.3, mood: "smile"},
    ],
  },
  {
    id: "spice-bowls", scene: "spice", at: 2, set: "spice", light: "warm", cInf: 8,
    from: {pos: [1.8, 2.3, -1.8], look: [0.4, 1.4, 2.5], fov: 48},
    to: {pos: [1.2, 2.1, -1.2], look: [0.4, 1.4, 2.5], fov: 44},
    people: () => [{who: "spiceSeller", x: 0.6, z: SPOTS.spice.keeperZ, mood: "laugh", pose: "cheer"}],
    effects: () => [tag("Spice capital of the world", 0.1, SAFFRON)],
  },
  {
    id: "spice-sticky", scene: "spice", at: 3.9, set: "spice", light: "warm", cInf: 10,
    from: {pos: [-2.3, 1.7, -3.2], look: [-1.5, 2, 1.3], fov: 42},
    to: {pos: [-2.1, 1.7, -2.6], look: [-1.5, 2, 1.3], fov: 38},
    people: () => [{who: "sticky", x: -1.5, z: 1.3, mood: "laugh", pose: "cheer"}],
    effects: () => [
      fx("chili", chiliIcon, -0.6, 3, 1.4, 0.6, 0.2),
      fx("chili", chiliIcon, -2.5, 2.8, 1.4, 0.5, 0.5),
      tag("#1 grower", 0.5, GREEN),
      tag("#1 exporter", 1.2, TEAL, 0.32),
    ],
  },
  {
    id: "spice-food", scene: "spice-food", at: 0, set: "spice", light: "warm", cInf: 6,
    from: {pos: [SIDE, 1.7, -5.6], look: [SIDE + 0.2, 1.7, 1], fov: 50},
    to: {pos: [SIDE + 0.1, 1.7, -4.8], look: [SIDE + 0.2, 1.7, 1], fov: 48},
    people: () => [
      {who: "cook", x: SIDE + 0.9, z: SPOTS.spice.foodFrontZ - 0.3, mood: "grin", pose: "wave"},
      {who: "sticky", x: SIDE - 0.5, z: 0, mood: "laugh", pose: "hold", held: "cup"},
    ],
    effects: () => [tag("So delicious!", 0.5, SAFFRON)],
  },
  // ---- 4. films ----
  {
    id: "films-cinema", scene: "films", at: 0, set: "cinema", light: "warm", cInf: 0,
    from: numberView,
    to: {pos: [0.6, 1.8, -7], look: [0, 2.6, 5], fov: 54},
    people: () => [
      {who: "sticky", x: 0, z: 0.2, mood: "smile"},
      {who: "fanA", x: 1.3, z: 1.6, mood: "grin"},
      {who: "fanB", x: -1.3, z: 2.2, mood: "smile", face: -1},
    ],
  },
  {
    id: "films-set", scene: "films", at: 2.3, set: "cinema", light: "warm", cInf: 6,
    from: {pos: [SET_X + 0.2, 1.7, -7], look: [SET_X + 0.3, 1.7, 1.6], fov: 50},
    to: {pos: [SET_X + 0.3, 1.7, -6.2], look: [SET_X + 0.3, 1.7, 1.6], fov: 48},
    people: () => [
      {who: "director", x: SET_X + 1.9, z: 1.2, mood: "grin", pose: "point"},
      {who: "sticky", x: SET_X - 0.3, z: 2.4, mood: "grin", pose: "wave"},
      {who: "actor", x: SET_X - 1.3, z: 2.7, mood: "laugh", pose: "cheer", face: -1},
    ],
    effects: () => [fx("clapper", clapperIcon, SET_X + 1.2, 2.75, 0.4, 0.7, 0.4), tag("1,500+ films a year", 2.2)],
  },
  {
    id: "films-crowd", scene: "films", at: 5.7, set: "cinema", light: "warm", cInf: 0,
    from: {pos: [-2.4, 2, -6.5], look: [0, 2.6, 4], fov: 54},
    to: {pos: [-1.2, 1.9, -5], look: [0, 2.6, 4], fov: 50},
    people: () => [
      {who: "sticky", x: 0, z: 0.4, mood: "laugh", pose: "cheer"},
      {who: "fanA", x: 1.4, z: 1.4, mood: "grin", pose: "cheer"},
      {who: "fanB", x: -1.4, z: 1.9, mood: "grin", pose: "wave", face: -1},
      {who: "fanC", x: 2.6, z: 2.8, mood: "smile"},
    ],
    effects: () => [tag("20+ languages", 0.6, TEAL)],
  },
  {
    id: "hits-tower", scene: "films-hits", at: 0, set: "cinema", light: "warm", cInf: 0,
    from: {pos: [TOWER_X + 1, 1.5, -7.5], look: [TOWER_X, 3.8, CINEMA.towerZ], fov: 60},
    to: {pos: [TOWER_X + 0.6, 1.4, -6.5], look: [TOWER_X, 4.2, CINEMA.towerZ], fov: 58},
    people: () => [
      {who: "sticky", x: TOWER_X - 1.7, z: 0.4, mood: "grin", pose: "cheer"},
      {who: "fanC", x: TOWER_X + 1.8, z: 0.9, mood: "grin", pose: "wave"},
    ],
  },
  {
    id: "hits-titles", scene: "films-hits", at: 2, set: "cinema", light: "warm", cInf: 0,
    from: {pos: [TOWER_X - 0.4, 2, -3.6], look: [TOWER_X, CINEMA.titleY[0], CINEMA.towerZ], fov: 46},
    to: {pos: [TOWER_X - 0.4, 2, -3.6], look: [TOWER_X, CINEMA.titleY[2], CINEMA.towerZ], fov: 46},
    people: () => [],
  },
  // ---- 5. Antilia ----
  {
    id: "antilia-street", scene: "antilia", at: 0, set: "mumbai", light: "golden", cInf: 0,
    from: numberViewAt(MUMBAI.streetX),
    to: {pos: [MUMBAI.streetX - 1.5, 1.7, -6.5], look: [MUMBAI.streetX + 1, 3.6, 6], fov: 56},
    people: () => [{who: "sticky", x: MUMBAI.streetX + 0.6, z: 0.5, mood: "smile"}],
  },
  {
    id: "antilia-tower", scene: "antilia", at: 2.2, set: "mumbai", light: "golden", cInf: 0,
    from: {pos: [15, 1.4, -14], look: [0, 15, MUMBAI.towerZ], fov: 70},
    to: {pos: [14, 1.4, -11.5], look: [0, 17, MUMBAI.towerZ], fov: 70},
    people: () => [{who: "sticky", x: 10.6, z: -5.5, mood: "shock", pose: "shrug"}],
    effects: () => [tag("Antilia, Mumbai", 0.3)],
  },
  {
    id: "antilia-sticky", scene: "antilia", at: 4.4, set: "mumbai", light: "golden", cInf: 8,
    from: {pos: [8, 1.5, -3.8], look: [6, 2.7, 3], fov: 48},
    to: {pos: [7.6, 1.5, -3], look: [6, 2.9, 3], fov: 44},
    people: () => [{who: "sticky", x: 6.3, z: 0.5, mood: "shock", pose: "shrug"}],
    effects: () => [tag("Often called the priciest home", 0.3, SAFFRON)],
  },
  {
    id: "facts-value", scene: "antilia-facts", at: 0, set: "mumbai", light: "golden", cInf: 0,
    from: {pos: [12.5, 1.6, -9], look: [0, 6, 14], fov: 60},
    to: {pos: [12, 1.6, -8], look: [0, 8, 14], fov: 60},
    people: () => [{who: "sticky", x: 8.6, z: -2.5, mood: "shock", pose: "cheer"}],
    // coins drift up in front of the tower
    effects: (t) => [
      ...stream("coin|$", 6, t, 0.22, (u, i) => fx("coin|$", coinIcon("$"), 3 + ((i * 2.3) % 5), 1.5 + u * 9, 3 + (i % 3), 0.8)),
      tag("About $2 billion", 1.1),
    ],
  },
  {
    id: "facts-floors", scene: "antilia-facts", at: 3, set: "mumbai", light: "golden", cInf: 0,
    from: {pos: [8, 3, -9], look: [0, 6, MUMBAI.towerZ], fov: 50},
    to: {pos: [8, 24, -9], look: [0, 29, MUMBAI.towerZ], fov: 50},
    people: () => [],
    effects: () => [tag("27 floors", 1.5)],
  },
  {
    id: "facts-helipads", scene: "antilia-facts", at: 5.4, set: "mumbai", light: "golden", cInf: 0,
    from: {pos: [8, MUMBAI.roofY + 9, 2], look: [0, MUMBAI.roofY, MUMBAI.towerZ], fov: 50},
    to: {pos: [5.5, MUMBAI.roofY + 11, 3.5], look: [0, MUMBAI.roofY, MUMBAI.towerZ], fov: 50},
    people: () => [{who: "sticky", x: -2.6, y: MUMBAI.roofY + 0.25, z: MUMBAI.towerZ - 2, mood: "grin", pose: "wave"}],
    effects: () => [tag("3 helipads", 0.2, SKY)],
  },
  {
    id: "facts-staff", scene: "antilia-facts", at: 6.7, set: "mumbai", light: "golden", cInf: 0,
    from: {pos: [2, 2.4, -3.5], look: [0, 1.8, 6.5], fov: 56},
    to: {pos: [1.2, 2.1, -2], look: [0, 1.8, 6.5], fov: 54},
    people: () => [{who: "sticky", x: 0, z: 2.6, mood: "shock", pose: "shrug"}, ...staff],
    effects: () => [tag("Staff of 600 (reported)", 0.6, GREEN)],
  },
  // ---- ending ----
  {
    id: "next-question", scene: "next", at: 0, set: "plaza", light: "warm", cInf: 8,
    from: {pos: [0.2, 1.8, -5], look: [-0.4, 2.1, 0.6], fov: 46},
    to: {pos: [0, 1.8, -4.2], look: [-0.4, 2.1, 0.6], fov: 42},
    people: () => [{who: "sticky", x: -0.6, z: 0.6, mood: "grin", pose: "shrug"}],
    effects: () => [tag("Which one surprised you?", 0.1), ...chapterIcons],
  },
  {
    id: "next-follow", scene: "next", at: 1.9, set: "plaza", light: "warm", cInf: 0,
    from: {pos: [-1.6, 2, -7], look: [0.6, 2.3, 2], fov: 54},
    to: {pos: [-1, 1.9, -6], look: [0.6, 2.3, 2], fov: 50},
    people: () => [{who: "sticky", x: -0.6, z: 0.6, mood: "laugh", pose: "wave"}, ...plazaFans],
    effects: () => [tag("Follow for 5 more", 0.4, TEAL)],
  },
];
