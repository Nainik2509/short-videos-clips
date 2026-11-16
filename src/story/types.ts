import type {Language} from '../lib/languages';
import type {PaletteName} from '../lib/palettes';
import type {CharacterLook, LookName} from '../rig';
import type {StageItem} from '../scenery';
import type {StyleName} from '../styles';

/** One character on screen in a scene. x / toX are screen pixels (0–1080); the feet follow the ground. */
export type CastMember = {
  look: LookName | CharacterLook;
  x: number;
  /** if set, the character moves from x to toX during the scene */
  toX?: number;
  scale?: number;
  facing?: 1 | -1;
  action?: 'idle' | 'walk' | 'wave' | 'walkWave';
  mood?: 'calm' | 'smile';
  blinkOffset?: number;
};

/** A rock that can slide across the ground and leave a trail (sailing-stones style stories). */
export type RockSpec = {
  x: number;
  toX?: number;
  size?: number;
  /** screen x where its trail starts; the trail grows with the rock */
  trailFrom?: number;
  /** show a glowing GPS beacon on top */
  gps?: boolean;
};

/** A thin floating ice panel (centre x, optionally moving to toX). */
export type IceSpec = {x: number; toX?: number};

export type Backdrop = {
  palette: PaletteName;
  sun?: {x: number; y: number; r?: number};
  moon?: {x: number; y: number; r?: number; phase?: number};
  clouds?: number;
  /** trees on [back, middle, front] hills; default [8, 7, 4] */
  trees?: [number, number, number];
  diyas?: boolean;
  sparks?: boolean;
  petals?: boolean;
  rocks?: RockSpec[];
  ice?: IceSpec[];
  /** ground scroll in px/second. Leave out: a walking character sets it so their feet match the ground. */
  scrollSpeed?: number;
  /** shifts which part of the hills this scene shows */
  offset?: number;
  /** explainer scenes: no hills, trees or clouds, just the sky colour (Stick Tales) */
  bare?: boolean;
  /** y of the ground line in bare scenes (default 1500); raise it so captions sit on the ground, below the pictures */
  floor?: number;
};

export type SceneSpec = {
  id: string;
  /** the exact spoken line (as in voice.txt). The scene starts on its first words. */
  line?: string;
  /** fixed start in seconds; wins over `line` */
  start?: number;
  /** seconds, only used when there are no timings yet */
  duration?: number;
  backdrop: Backdrop;
  cast?: CastMember[];
  /** explainer props drawn behind the characters: panes, arrows, labels, fog (see src/scenery/Stage.tsx) */
  stage?: StageItem[];
  /** labels and arrows drawn in front of the characters */
  front?: StageItem[];
  /** slow push-in: end zoom, 1 = none (default 1.05) */
  push?: number;
};

export type StorySpec = {
  slug: string;
  title: string;
  /** the question the reel opens with (shown big in the first seconds and on the cover) */
  hook: string;
  language: Language;
  style: StyleName;
  series?: string;
  part?: number;
  /** index of the scene used for the cover image (default 0) */
  heroScene?: number;
  /** seconds of picture after the last word (default 1) */
  tail?: number;
  /** total seconds when there is no voice-over yet */
  duration?: number;
  scenes: SceneSpec[];
};
