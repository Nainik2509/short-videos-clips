// The people of "5 Things India Is #1 In": Sticky (the narrator) plus one-off stick figures per place.
import type {Look} from "../../toon3d/figures";
import {INK} from "../../toon3d/toon";

const WHITE = "#fffaf2";

export const LOOKS = {
  sticky: {head: WHITE, vest: "#ff8a1f", trim: "#ffc93c", hat: "beanie", hatColor: "#2f6bff"},
  farmer: {head: WHITE, vest: "#1fa35a", trim: WHITE, hat: "topi", hatColor: WHITE, extras: ["moustache"]},
  postman: {head: WHITE, vest: "#b08d57", trim: WHITE, hat: "cap", hatColor: "#d7263d", extras: ["moustache"]},
  spiceSeller: {head: WHITE, vest: "#e8344a", trim: "#ffc93c", hat: "topi", hatColor: "#ffc93c", extras: ["moustache", "apron"]},
  cook: {head: WHITE, vest: "#2ec4b6", trim: WHITE, hat: "topi", hatColor: WHITE, extras: ["apron"]},
  director: {head: WHITE, vest: "#17124a", trim: "#ffc93c", hat: "cap", hatColor: "#23232b", extras: ["glasses"]},
  actor: {head: WHITE, vest: "#7a4fd6", trim: "#ffc93c", hat: "hair", hatColor: INK, extras: ["bindi"]},
  fanA: {head: WHITE, vest: "#e8344a", trim: WHITE, hat: "hair", hatColor: INK, extras: ["bindi"]},
  fanB: {head: WHITE, vest: "#3ddc84", trim: WHITE, hat: "cap", hatColor: "#7a4fd6"},
  fanC: {head: WHITE, vest: "#2f6bff", trim: WHITE, hat: "hair", hatColor: "#5a3b2a", extras: ["glasses"]},
  staffA: {head: WHITE, vest: "#17124a", trim: WHITE, hat: "hair", hatColor: INK, extras: ["tie"]},
  staffB: {head: WHITE, vest: "#ffffff", trim: "#17124a", hat: "topi", hatColor: WHITE, extras: ["apron"]},
  staffC: {head: WHITE, vest: "#5d7fa8", trim: WHITE, hat: "cap", hatColor: "#17124a"},
} satisfies Record<string, Look>;
export type Who = keyof typeof LOOKS;
