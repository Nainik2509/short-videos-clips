// What a 3D reel is made of: sets, looks and a shot list. One reel = one folder in src/videos that fills in a
// `Reel`; the player (Reel3D.tsx) and the world (world.ts) are shared by every reel.
//
// A scene (one line of the voice) gets two or three shots, so the picture changes about every 2.5 s. A shot is a
// set, a light, a camera move (from -> to) and who/what is on screen at time t (seconds into the shot).
// Screen note: looking along +z, world +x is on the LEFT of the picture.
import type * as THREE from "three";
import type {Cam, Move, V3} from "./camera";
import {blobPlace, tierFor, type FxPlace, type Place} from "./cards";
import {drawFigure, figureKey, type FigureSpec, type Held, type Look, type Mood, type Pose} from "./figures";
import {labelIcon, type Icon} from "./icons";
import type {LightName} from "./lights";

/** One character in a shot, in world coordinates (feet on `y`, default the reel's `groundY`). */
export type Person<Who extends string = string> = {
  who: Who;
  x: number;
  z: number;
  y?: number;
  mood?: Mood;
  pose?: Pose;
  held?: Held;
  /** 1 = as drawn (arms on screen right), -1 = mirrored */
  face?: 1 | -1;
  scale?: number;
};

/**
 * One icon or label in a shot; `at` = seconds into the shot when it pops in.
 * Fixed in the world (x, y, z, w metres) it is a 3D card beside the action. Pinned to the picture it is drawn on top
 * of the frame as a crisp overlay (x and y in -1..1 across the frame, `span` = its width as a share of the frame
 * width), so it always fits and is never blurred, outlined or cut by the world.
 */
export type WorldEffect = {id: string; icon: Icon; at?: number; x: number; y: number; z: number; w: number};
export type PinnedEffect = {id: string; icon: Icon; at?: number; screen: {x: number; y: number; span: number}};
export type Effect = WorldEffect | PinnedEffect;
export const isPinned = (e: Effect): e is PinnedEffect => "screen" in e;

export type Shot<SetName extends string = string, Who extends string = string> = {
  id: string;
  /** scene id in the story's story.json */
  scene: string;
  /** seconds into the scene; the last shot of a scene runs to its end */
  at: number;
  set: SetName;
  light: LightName;
  from: Move;
  to: Move;
  /** depth-of-field strength (px of blur at infinity at 1080x1920); 0 = everything sharp */
  cInf: number;
  /** what the lens focuses on; default: the camera's look point */
  focus?: V3;
  people: (t: number) => Person<Who>[];
  effects?: (t: number) => Effect[];
};

export type Reel<SetName extends string = string, Who extends string = string> = {
  /** builds every set once; each group is already placed where its shots expect it */
  sets: () => Record<SetName, THREE.Object3D>;
  looks: Record<Who, Look>;
  shots: Shot<SetName, Who>[];
  /** the picture behind the cover title, shown at the end of its camera move (default: the story's hero frame) */
  cover?: Shot<SetName, Who>;
  /** height people stand on when a shot gives no `y` (default 0) */
  groundY?: number;
};

/** Checks a reel's set and cast names against its shots at compile time, then forgets them for the shared player. */
export const defineReel = <SetName extends string, Who extends string>(reel: Reel<SetName, Who>): Reel => reel as unknown as Reel;

// ---------------- effects a shot list writes ----------------
/** an icon fixed in the world, `w` metres wide */
export const fx = (id: string, icon: Icon, x: number, y: number, z: number, w: number, at = 0): Effect => ({id, icon, x, y, z, w, at});

/** a label pinned to the picture (`sy` 0.55 = upper part of the frame); its width follows the text */
export const tag = (text: string, at: number, bg = "#ffc93c", sy = 0.55): Effect => ({
  id: `label|${text}|${bg}`, icon: labelIcon(text, bg, undefined, Math.max(640, 40 * text.length + 120)), at,
  screen: {x: 0, y: sy, span: Math.min(0.8, Math.max(0.34, 0.045 * text.length + 0.18))},
});

/** an icon pinned to the picture */
export const badge = (id: string, icon: Icon, at: number, x: number, y: number, span: number): Effect => ({id, icon, at, screen: {x, y, span}});

// ---------------- timing ----------------
/** the shot showing at `seconds` into scene `scene` (the last shot of the scene whose start has passed) */
export const shotFor = (shots: Shot[], scene: string, seconds: number): {shot: Shot; next?: Shot} => {
  const own = shots.filter((s) => s.scene === scene);
  const list = own.length ? own : shots.slice(0, 1);
  let i = 0;
  while (i + 1 < list.length && seconds >= list[i + 1].at) i++;
  return {shot: list[i], next: list[i + 1]};
};

const easeOutBack = (u: number) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};
/** 0 before `at`, then a quick overshoot pop to 1 */
export const popScale = (t: number, at = 0) => (t < at ? 0 : easeOutBack(Math.min(1, (t - at) / 0.28)));

// ---------------- cards ----------------
const PHASES = 24;

/** deterministic blink: 0.13 s shut every ~2.6 s, offset per person so a crowd does not blink together */
const blinkAt = (t: number, seed: number) => (t + seed * 0.73) % 2.6 < 0.13;

/** cards for one person: the figure and its contact blob */
export const personCards = (p: Person, look: Look, groundY: number, index: number, t: number, cam: Cam): {place: Place; blob: FxPlace} => {
  const y = p.y ?? groundY;
  const pose = p.pose ?? "idle";
  const cycle = pose === "walk" ? t : t * 0.5 + index * 0.13;
  const phase = Math.round((((cycle % 1) + 1) % 1) * PHASES) / PHASES;
  const spec: FigureSpec = {look, mood: p.mood ?? "smile", pose, held: p.held ?? null, phase, blink: blinkAt(t, index)};
  const dist = Math.hypot(cam.pos[0] - p.x, cam.pos[2] - p.z);
  const scale = p.scale ?? 1;
  return {
    place: {
      key: figureKey(p.who, spec), draw: (pen) => drawFigure(pen, spec),
      x: p.x, y, z: p.z, scale, mirror: p.face === -1, size: tierFor(dist),
    },
    blob: blobPlace(p.x, y, p.z, 1.5 * scale),
  };
};

/** card for a world effect at its pop-in time (hidden before `at`) */
export const effectCard = (e: WorldEffect, t: number): FxPlace | null => {
  const s = popScale(t, e.at ?? 0);
  if (s <= 0.01) return null;
  const w = e.w * s;
  return {key: e.id, cw: e.icon.cw, ch: e.icon.ch, draw: e.icon.draw, x: e.x, y: e.y, z: e.z, w, h: (w * e.icon.ch) / e.icon.cw};
};
