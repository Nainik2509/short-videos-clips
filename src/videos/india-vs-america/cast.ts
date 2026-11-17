// The people of "3 Things India Does Better Than America": who they are (looks).
import type {Look} from "../../toon3d/figures";
import {INK} from "../../toon3d/toon";

const WHITE = "#fffaf2";

/** Sticky is the everyday person in both countries; everyone else is a one-off with their own hat. */
export const LOOKS = {
  sticky: {head: WHITE, vest: "#ff8a1f", trim: "#ffc93c", hat: "beanie", hatColor: "#2f6bff"},
  chai: {head: WHITE, vest: "#2ec4b6", trim: "#fffaf2", hat: "topi", hatColor: "#fffaf2", extras: ["moustache", "apron"]},
  silk: {head: WHITE, vest: "#e8344a", trim: "#ffc93c", hat: "hair", hatColor: INK, extras: ["glasses", "bindi"]},
  phone: {head: WHITE, vest: "#2f6bff", trim: "#ffc93c", hat: "cap", hatColor: "#ffc93c", extras: ["glasses"]},
  pharmacist: {head: WHITE, vest: "#ffffff", trim: "#1fa35a", hat: "hair", hatColor: "#5a3b2a", extras: ["coat", "glasses"]},
  clerk: {head: WHITE, vest: "#5d7fa8", trim: "#fffaf2", hat: "cap", hatColor: "#6b7280"},
  doctor: {head: WHITE, vest: "#2ec4b6", trim: "#ffffff", hat: "hair", hatColor: "#e8a04a", extras: ["coat"]},
  teller: {head: WHITE, vest: "#17124a", trim: "#ffc93c", hat: "hair", hatColor: "#2b2b2b", extras: ["tie"]},
  shopperA: {head: WHITE, vest: "#e8344a", trim: "#fffaf2", hat: "hair", hatColor: INK, extras: ["bindi"]},
  shopperB: {head: WHITE, vest: "#7a4fd6", trim: "#fffaf2", hat: "cap", hatColor: "#3ddc84"},
  shopperC: {head: WHITE, vest: "#3ddc84", trim: "#fffaf2", hat: "topi", hatColor: "#ffffff"},
} satisfies Record<string, Look>;
export type Who = keyof typeof LOOKS;
