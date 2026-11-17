// The people of "The Last Over": Sticky (narrator), the Dhoni stick figure in the colours of each chapter of his story,
// and one-off fans, team-mates and rivals. Stick figures only: no real likeness, no team logos (colours only).
import type {Look} from "../../toon3d/figures";
import {INK} from "../../toon3d/toon";

const WHITE = "#fffaf2";
const BLUE = "#1f4fd8";
const YELLOW = "#ffd23c";

export const LOOKS = {
  sticky: {head: WHITE, vest: "#ff8a1f", trim: "#ffc93c", hat: "beanie", hatColor: "#2f6bff"},
  /** the boy who stood in goal */
  boy: {head: WHITE, vest: "#3ddc84", trim: WHITE, hat: "hair", hatColor: INK},
  /** friends on the Ranchi ground */
  friendA: {head: WHITE, vest: "#e8344a", trim: WHITE, hat: "hair", hatColor: "#5a3b2a"},
  friendB: {head: WHITE, vest: "#7a4fd6", trim: WHITE, hat: "cap", hatColor: "#ffc93c"},
  /** the railway job */
  examiner: {head: WHITE, vest: "#17124a", trim: WHITE, hat: "cap", hatColor: "#17124a", extras: ["coat"]},
  traveller: {head: WHITE, vest: "#2ec4b6", trim: WHITE, hat: "topi", hatColor: WHITE},
  /** the India captain, in India blue */
  dhoni: {head: WHITE, vest: BLUE, trim: "#ffc93c", hat: "hair", hatColor: INK},
  mateA: {head: WHITE, vest: BLUE, trim: WHITE, hat: "hair", hatColor: "#5a3b2a"},
  mateB: {head: WHITE, vest: BLUE, trim: WHITE, hat: "cap", hatColor: BLUE, extras: ["glasses"]},
  /** the other side, one maroon colour */
  rival: {head: WHITE, vest: "#8c1f3a", trim: WHITE, hat: "cap", hatColor: "#8c1f3a"},
  /** Chennai yellow */
  dhoniYellow: {head: WHITE, vest: YELLOW, trim: BLUE, hat: "hair", hatColor: INK},
  youngA: {head: WHITE, vest: YELLOW, trim: BLUE, hat: "cap", hatColor: YELLOW},
  youngB: {head: WHITE, vest: YELLOW, trim: WHITE, hat: "hair", hatColor: INK, extras: ["glasses"]},
  /** fans */
  fanBlue: {head: WHITE, vest: BLUE, trim: WHITE, hat: "hair", hatColor: INK, extras: ["bindi"]},
  fanBlue2: {head: WHITE, vest: "#3a7bff", trim: "#ffc93c", hat: "cap", hatColor: "#17124a"},
  fanYellow: {head: WHITE, vest: YELLOW, trim: "#17124a", hat: "hair", hatColor: INK, extras: ["bindi"]},
  fanYellow2: {head: WHITE, vest: "#ffb400", trim: WHITE, hat: "topi", hatColor: YELLOW, extras: ["moustache"]},
} satisfies Record<string, Look>;
export type Who = keyof typeof LOOKS;
