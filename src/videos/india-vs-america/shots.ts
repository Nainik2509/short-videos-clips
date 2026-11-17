// The shot list of "3 Things India Does Better Than America": two or three shots per scene (see toon3d/reel.ts).
// Scene ids match stories/india-vs-america-3-things/story.json.
import type {Move} from "../../toon3d/camera";
import {coinIcon, receiptIcon, rxIcon, signalIcon, tickIcon} from "../../toon3d/icons";
import {badge, fx, tag, type Person, type Shot} from "../../toon3d/reel";
import type {Who} from "./cast";
import {INDIA_X as IX, SPOTS, USA_X as UX, type SetName} from "./sets";

type Crowd = Person<Who>[];

const IN = SPOTS.india;
const US = SPOTS.usa;

/** people standing around, so the street is never empty */
const indiaCrowd = (z: number): Crowd => [
  {who: "shopperA", x: 3.3, z: z - 4, mood: "smile"},
  {who: "shopperB", x: -5.6, z: z + 2, mood: "grin", face: -1},
  {who: "shopperC", x: -6.4, z: z - 5, mood: "smile"},
];
const usaCrowd = (z: number): Crowd => [{who: "shopperB", x: UX + 10.6, z: z - 6, mood: "neutral"}];

/** the camera starts looking up at the hanging banner of this street position, then settles on the shop */
const bannerView = (z: number, lead: number): Move => ({pos: [IX + 0.5, 1.5, z - lead], look: [IX + 0.5, 7.2, z], fov: 62});

export const SHOTS: Shot<SetName, Who>[] = [
  // ---- 1. hook: two streets ----
  {
    id: "hook-india", scene: "hook", at: 0, set: "india", light: "warm", cInf: 0,
    from: {pos: [IX - 3, 2.3, -21], look: [IX + 4, 2.2, -6], fov: 56},
    to: {pos: [IX - 1.5, 2.0, -16], look: [IX + 4.5, 2.2, -6], fov: 50},
    people: () => [
      {who: "sticky", x: IX + 4.6, z: -7, mood: "grin", pose: "wave"},
      {who: "chai", x: IX + IN.chaiKeeperX, z: -10, mood: "smile"},
      ...indiaCrowd(-8),
    ],
  },
  {
    id: "hook-usa", scene: "hook", at: 3.0, set: "usa", light: "cool", cInf: 0,
    from: {pos: [UX + 1, 2.0, -15], look: [UX + 9.5, 2.0, -3], fov: 54},
    to: {pos: [UX + 3, 1.8, -10.5], look: [UX + 9.5, 1.9, -3], fov: 46},
    people: () => [{who: "sticky", x: UX + US.sidewalkX, z: -4, mood: "worry", pose: "shrug"}, ...usaCrowd(-4)],
  },
  // ---- 2. UPI ----
  {
    id: "upi-chai", scene: "upi", at: 0, set: "india", light: "warm", cInf: 0,
    from: bannerView(IN.chai, 9),
    to: {pos: [IX + 1.0, 1.6, -14], look: [IX + 5.7, 1.8, -10], fov: 46},
    people: () => [
      {who: "sticky", x: IX + IN.customerX - 0.3, z: -10.2, mood: "smile", pose: "phone", held: "phone"},
      {who: "chai", x: IX + IN.chaiKeeperX, z: -10, mood: "grin"},
    ],
    effects: () => [fx("tick", tickIcon, IX + 5.4, 2.55, -9.3, 0.75, 2.6)],
  },
  {
    id: "upi-silk", scene: "upi", at: 3.2, set: "india", light: "warm", cInf: 8,
    from: {pos: [IX + 1.0, 1.6, -25.5], look: [IX + 6.2, 1.9, -21.2], fov: 44},
    to: {pos: [IX + 2.0, 1.6, -24], look: [IX + 6.2, 1.9, -21.2], fov: 40},
    people: () => [
      {who: "sticky", x: IX + 5.2, z: -21.4, mood: "grin", pose: "phone", held: "phone"},
      {who: "silk", x: IX + IN.keeperX, z: -21, mood: "smile"},
    ],
    effects: () => [fx("tick", tickIcon, IX + 6.2, 2.7, -20.2, 0.8, 0.9), tag("SCAN & PAY", 1.4)],
  },
  {
    id: "upi-done", scene: "upi", at: 6.0, set: "india", light: "warm", cInf: 10,
    from: {pos: [IX + 1.0, 1.8, -14.6], look: [IX + 5.8, 1.9, -10], fov: 42},
    to: {pos: [IX + 2.0, 1.8, -13.6], look: [IX + 5.8, 1.9, -10], fov: 36},
    people: () => [
      {who: "sticky", x: IX + 4.8, z: -10.1, mood: "laugh", pose: "cheer"},
      {who: "chai", x: IX + IN.chaiKeeperX, z: -10, mood: "laugh", pose: "wave"},
    ],
    effects: () => [fx("tick", tickIcon, IX + 5.4, 2.55, -9.3, 0.75, 0), tag("Chai, scan, done", 0.5)],
  },
  // ---- 3. card fees in America ----
  {
    id: "cards-checkout", scene: "cards", at: 0, set: "usa", light: "cool", cInf: 6,
    from: {pos: [UX + 8.5, 1.7, 23.5], look: [UX + 16.5, 1.8, 28], fov: 44},
    to: {pos: [UX + 9.5, 1.7, 24.5], look: [UX + 16.5, 1.8, 28], fov: 40},
    people: () => [
      {who: "sticky", x: UX + US.customerX, z: 27.6, mood: "worry", pose: "hold", held: "card"},
      {who: "clerk", x: UX + US.keeperX, z: 28.4, mood: "neutral"},
    ],
    effects: (t) => [fx("coin|$", coinIcon("$"), UX + 15.9, 2.35 + Math.min(1.4, Math.max(0, t - 1.2) * 0.9), 27.9, 0.6, 1.2)],
  },
  {
    id: "cards-bank", scene: "cards", at: 3.8, set: "usa", light: "cool", cInf: 0,
    from: {pos: [UX + 2, 3.2, -9], look: [UX + 15, 5.2, -26], fov: 56},
    to: {pos: [UX + 5, 3.0, -13], look: [UX + 16, 5.0, -26], fov: 50},
    people: () => [{who: "teller", x: UX + 16.8, z: -26, mood: "grin", pose: "cheer"}, {who: "sticky", x: UX + 9.6, z: -16, mood: "worry"}],
    effects: (t) => [
      ...[0, 1, 2, 3].map((i) => {
        const p = (t * 0.55 + i / 4) % 1;
        return fx("coin|$", coinIcon("$"), UX + 9.8 + p * 7, 2.4 + Math.sin(p * Math.PI) * 1.4, -17 - p * 9, 0.7, 0.4);
      }),
      tag("$66B in fees", 1.2, "#ff8a1f"),
    ],
  },
  {
    id: "cards-swiping", scene: "cards", at: 6.8, set: "usa", light: "cool", cInf: 6,
    from: {pos: [UX + 4, 1.8, -14], look: [UX + 11.5, 2.2, -21], fov: 44},
    to: {pos: [UX + 6, 1.8, -15.5], look: [UX + 12.5, 2.2, -21], fov: 38},
    people: () => [
      {who: "sticky", x: UX + 11.4, z: -20.4, mood: "shock", pose: "hold", held: "card"},
      {who: "teller", x: UX + 14.2, z: -22.5, mood: "laugh", pose: "cheer"},
    ],
    effects: (t) =>
      [0, 1, 2].map((i) => {
        const p = (t * 0.7 + i / 3) % 1;
        return fx("coin|$", coinIcon("$"), UX + 11.8 + p * 3, 2.3 + Math.sin(p * Math.PI) * 1.1, -20.6 - p * 1.8, 0.55, 0);
      }),
  },
  // ---- 4. mobile data in India ----
  {
    id: "data-india-shop", scene: "data-india", at: 0, set: "india", light: "warm", cInf: 0,
    from: bannerView(IN.mobile, 9),
    to: {pos: [IX + 1.0, 1.7, -4], look: [IX + 5.8, 2.0, 0], fov: 46},
    people: () => [
      {who: "sticky", x: IX + IN.customerX, z: 0.2, mood: "grin", pose: "phone", held: "phone"},
      {who: "phone", x: IX + IN.keeperX, z: 0.4, mood: "grin"},
    ],
    effects: () => [fx("bars4", signalIcon(4), IX + 5.1, 3.2, -0.6, 0.9, 1.6)],
  },
  {
    id: "data-india-5g", scene: "data-india", at: 3.0, set: "india", light: "warm", cInf: 10,
    from: {pos: [IX + 1.8, 1.8, -3.5], look: [IX + 4.8, 2.1, 0], fov: 38},
    to: {pos: [IX + 2.6, 1.8, -2.6], look: [IX + 4.8, 2.1, 0], fov: 32},
    people: () => [{who: "sticky", x: IX + 4.9, z: 0, mood: "grin", pose: "phone", held: "phone"}],
    effects: () => [tag("5G", 0.3, "#3ddc84"), tag("from ₹198", 1.2, "#ffc93c", 0.32)],
  },
  {
    id: "data-india-scroll", scene: "data-india", at: 6.0, set: "india", light: "warm", cInf: 8,
    from: {pos: [IX + 1.6, 1.8, -4.2], look: [IX + 4.9, 2.0, 0], fov: 44},
    to: {pos: [IX + 2.6, 1.9, -3.4], look: [IX + 4.9, 2.0, 0], fov: 38},
    people: () => [
      {who: "sticky", x: IX + 4.9, z: 0, mood: "laugh", pose: "cheer"},
      {who: "shopperA", x: IX + 3.0, z: 1.8, mood: "grin", pose: "phone", held: "phone", face: -1},
    ],
    effects: () => [tag("Scroll more, pay less", 0.3, "#3ddc84")],
  },
  // ---- 5. mobile data in America ----
  {
    id: "data-usa-shop", scene: "data-usa", at: 0, set: "usa", light: "cool", cInf: 6,
    from: {pos: [UX + 5, 1.7, -14], look: [UX + 12.5, 2.0, -8], fov: 44},
    to: {pos: [UX + 7, 1.7, -12.5], look: [UX + 12.5, 2.1, -8], fov: 38},
    people: () => [
      {who: "sticky", x: UX + 12.4, z: -8, mood: "shock", pose: "phone", held: "phone"},
      {who: "clerk", x: UX + US.keeperX, z: -8.8, mood: "neutral"},
    ],
    effects: () => [tag("$45+", 0.6, "#e8344a"), fx("bars1", signalIcon(1), UX + 13.4, 3.2, -8.6, 0.8, 1.2)],
  },
  {
    id: "data-usa-close", scene: "data-usa", at: 2.6, set: "usa", light: "cool", cInf: 10,
    from: {pos: [UX + 8.2, 1.8, -11.5], look: [UX + 12.2, 2.1, -8], fov: 36},
    to: {pos: [UX + 9.2, 1.8, -10.6], look: [UX + 12.2, 2.1, -8], fov: 30},
    people: () => [{who: "sticky", x: UX + 12.2, z: -8.1, mood: "worry", pose: "phone", held: "phone"}],
    effects: () => [fx("bars1", signalIcon(1), UX + 12.9, 3.5, -8.7, 0.9, 0.2), tag("per line, per month", 0.9, "#e8344a", 0.32)],
  },
  // ---- 6. medicine in India ----
  {
    id: "med-india-pharmacy", scene: "medicine-india", at: 0, set: "india", light: "warm", cInf: 0,
    from: bannerView(IN.pharmacy, 9),
    to: {pos: [IX + 1.0, 1.7, 6], look: [IX + 5.8, 1.9, 10.2], fov: 46},
    people: () => [
      {who: "sticky", x: IX + IN.customerX, z: 10.2, mood: "grin"},
      {who: "pharmacist", x: IX + IN.keeperX, z: 10.4, mood: "smile"},
    ],
  },
  {
    id: "med-india-strip", scene: "medicine-india", at: 3.0, set: "india", light: "warm", cInf: 8,
    from: {pos: [IX + 0.6, 1.7, 6.0], look: [IX + 6.2, 1.9, 10.3], fov: 46},
    to: {pos: [IX + 1.4, 1.7, 6.8], look: [IX + 6.2, 1.9, 10.3], fov: 42},
    people: () => [
      {who: "sticky", x: IX + 5.0, z: 10.4, mood: "relief", pose: "hold", held: "strip"},
      {who: "pharmacist", x: IX + IN.keeperX, z: 10.2, mood: "smile", pose: "point"},
    ],
    effects: () => [tag("No appointment", 0.4, "#3ddc84")],
  },
  // ---- 7. medicine in America ----
  {
    id: "med-usa-clinic", scene: "medicine-usa", at: 0, set: "usa", light: "cool", cInf: 6,
    from: {pos: [UX + 4, 1.7, 3], look: [UX + 15, 2.0, 10], fov: 46},
    to: {pos: [UX + 7, 1.7, 5], look: [UX + 15, 2.1, 10], fov: 38},
    people: () => [
      {who: "sticky", x: UX + 14.6, z: 10, mood: "shock", pose: "hold", held: "receipt"},
      {who: "doctor", x: UX + US.keeperX, z: 10.4, mood: "neutral"},
    ],
    effects: () => [tag("Prescription first", 0.6, "#2ec4b6")],
  },
  {
    id: "med-usa-bill", scene: "medicine-usa", at: 3.4, set: "usa", light: "cool", cInf: 10,
    from: {pos: [UX + 9.4, 1.8, 6.4], look: [UX + 14.4, 2.0, 10], fov: 40},
    to: {pos: [UX + 10.4, 1.8, 7.0], look: [UX + 14.4, 2.0, 10], fov: 34},
    people: () => [{who: "sticky", x: UX + 14.4, z: 10, mood: "shock", pose: "hold", held: "receipt"}],
    effects: () => [
      badge("receipt", receiptIcon(["Check-in", "Exam", "Fee"], "~$170"), 0.2, 0.55, -0.05, 0.3),
      tag("~$170 visit", 0.8, "#e8344a", 0.32),
    ],
  },
  // ---- 8. the catch ----
  {
    id: "catch-rx", scene: "catch", at: 0, set: "india", light: "warm", cInf: 8,
    from: {pos: [IX + 0.8, 1.7, 6.2], look: [IX + 6.2, 1.9, 10.3], fov: 46},
    to: {pos: [IX + 1.6, 1.7, 7.0], look: [IX + 6.2, 1.9, 10.3], fov: 42},
    people: () => [
      {who: "sticky", x: IX + 5.0, z: 10.4, mood: "neutral"},
      {who: "pharmacist", x: IX + IN.keeperX, z: 10.2, mood: "neutral", pose: "point"},
    ],
    effects: () => [badge("rx", rxIcon, 0.3, -0.5, 0.0, 0.3), tag("Antibiotics need an Rx", 0.9, "#ff7a8a", 0.32)],
  },
  {
    id: "catch-health", scene: "catch", at: 3.2, set: "india", light: "warm", cInf: 8,
    from: {pos: [IX + 1.4, 1.7, 7.2], look: [IX + 5.4, 1.9, 10.3], fov: 40},
    to: {pos: [IX + 2.2, 1.7, 7.8], look: [IX + 5.4, 1.9, 10.3], fov: 34},
    people: () => [
      {who: "sticky", x: IX + 4.8, z: 10.4, mood: "relief", pose: "hold"},
      {who: "pharmacist", x: IX + IN.keeperX, z: 10.2, mood: "smile"},
    ],
    effects: () => [tag("Health first, always", 0.4, "#3ddc84")],
  },
  // ---- 9. outro ----
  {
    id: "next-both", scene: "next", at: 0, set: "india", light: "warm", cInf: 0,
    from: {pos: [IX - 1, 2.0, -3], look: [IX + 3, 2.2, 2], fov: 50},
    to: {pos: [IX - 1.5, 2.3, -8], look: [IX + 3, 2.3, 2], fov: 56},
    people: () => [
      {who: "sticky", x: IX + 3.2, z: 1.2, mood: "grin", pose: "cheer"},
      {who: "phone", x: IX + 5.4, z: 2.2, mood: "smile"},
      {who: "pharmacist", x: IX + 1.2, z: 2.8, mood: "smile", face: -1},
    ],
    effects: () => [tag("Which one wins?", 0.6), tag("1  2  3", 1.6, "#2ec4b6", 0.32)],
  },
  {
    id: "next-usa", scene: "next", at: 4.4, set: "usa", light: "cool", cInf: 0,
    from: {pos: [UX + 2, 2.2, -12], look: [UX + 9.5, 2.2, -3], fov: 54},
    to: {pos: [UX + 4, 2.0, -9], look: [UX + 9.5, 2.2, -3], fov: 46},
    people: () => [
      {who: "sticky", x: UX + US.sidewalkX, z: -3.5, mood: "grin", pose: "wave"},
      ...usaCrowd(-3),
    ],
    effects: () => [tag("Next: 3 things America does better", 0.5, "#9ad8ff")],
  },
];
