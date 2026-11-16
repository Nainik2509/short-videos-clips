import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import type {Palette} from '../lib/palettes';
import type {CharacterLook} from '../rig';
import {HEIGHT, WIDTH} from '../lib/theme';

/**
 * A style is the "one look per series": palette, how characters are coloured, a finishing
 * overlay, and how many drawings per second the animation uses. Pick one in story.json ("style").
 * These are presets: refine any of them here and every story using that style updates.
 */
export type StyleName = 'flat' | 'paperCutout' | 'madhubani' | 'glowLine' | 'stickTales';

export type StyleSpec = {
  label: string;
  note: string;
  /** animation "drawings per second"; 0 = smooth, every frame */
  drawingsPerSec: number;
  palette: (base: Palette) => Palette;
  look: (look: CharacterLook) => CharacterLook;
  /** CSS filter on the whole scene */
  filter?: string;
  /** CSS filter on the characters only */
  charFilter?: string;
  Overlay?: React.FC;
};

const same = <T,>(x: T) => x;

// ---------- overlays ----------

const PaperGrain: React.FC = () => {
  const id = useId().replace(/:/g, '');
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.22}}>
      <svg width={WIDTH} height={HEIGHT}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0.9 0" />
        </filter>
        <rect width={WIDTH} height={HEIGHT} filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

const MadhubaniBorder: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={WIDTH} height={HEIGHT}>
      <rect x={14} y={14} width={WIDTH - 28} height={HEIGHT - 28} fill="none" stroke="#111" strokeWidth={10} />
      <rect x={38} y={38} width={WIDTH - 76} height={HEIGHT - 76} fill="none" stroke="#c0392b" strokeWidth={14} />
      <rect x={66} y={66} width={WIDTH - 132} height={HEIGHT - 132} fill="none" stroke="#111" strokeWidth={5} strokeDasharray="4 14" />
    </svg>
  </AbsoluteFill>
);

// ---------- looks ----------

const glowLook = (l: CharacterLook): CharacterLook => ({
  ...l,
  skin: '#07070f',
  hair: '#07070f',
  top: '#07070f',
  bottom: '#07070f',
  accent: '#07070f',
  shoe: '#07070f',
  ink: l.top, // each character glows in the colour of their clothes
});

export const styles: Record<StyleName, StyleSpec> = {
  flat: {
    label: 'Flat colour',
    note: 'The default clean look: smooth motion, bold ink outlines.',
    drawingsPerSec: 0,
    palette: same,
    look: same,
  },
  paperCutout: {
    label: 'Paper cut-out',
    note: 'Layered paper with soft shadows, light paper grain, stop-motion at 12 drawings a second.',
    drawingsPerSec: 12,
    palette: (p) => ({...p, ink: '#ffffff'}),
    look: (l) => ({...l, ink: '#ffffff'}),
    charFilter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.38))',
    Overlay: PaperGrain,
  },
  madhubani: {
    label: 'Madhubani',
    note: 'Bihar folk painting: thick black outlines, flat red/yellow/green/blue, patterned border, nothing shaded.',
    drawingsPerSec: 0,
    palette: (p) => ({
      ...p,
      skyTop: '#f6e7c1',
      skyMid: '#f6e7c1',
      skyBottom: '#f6e7c1',
      stars: 0,
      hills: ['#e8a33d', '#d9482b', '#2f8f5b'],
      cloud: '#2a6fb0',
      leaf: ['#2f8f5b', '#1f6f8f'],
      trunk: '#7a2e1a',
      ink: '#111111',
      glow: '#e8a33d',
    }),
    look: (l) => ({...l, ink: '#111111'}),
    Overlay: MadhubaniBorder,
  },
  glowLine: {
    label: 'Glow line art',
    note: 'Glowing outlines on black under a spotlight: dramatic and modern.',
    drawingsPerSec: 0,
    palette: (p) => ({
      ...p,
      skyTop: '#05050c',
      skyMid: '#0a0a18',
      skyBottom: '#14142a',
      stars: 0.6,
      hills: ['#0c0c1c', '#090914', '#05050c'],
      cloud: '#1a1a33',
      leaf: ['#0a0a14', '#0e0e1c'],
      trunk: '#0a0a14',
      ink: '#ffd66b',
      glow: '#ffd66b',
    }),
    look: glowLook,
    charFilter: 'drop-shadow(0 0 7px rgba(255,214,107,0.9))',
  },
  stickTales: {
    label: 'Stick Tales',
    note: 'Flat bright teal, thick black outlines, round white heads and line limbs: a clean explainer look (English series).',
    drawingsPerSec: 0,
    palette: (p) => ({
      ...p,
      skyTop: '#5fd6cc',
      skyMid: '#5fd6cc',
      skyBottom: '#7fe0d6',
      stars: 0,
      hills: ['#ffd45e', '#ffb347', '#ff8a1f'],
      cloud: '#ffffff',
      leaf: ['#2fa36b', '#3cc283'],
      trunk: '#6b3f1d',
      ink: '#111111',
      glow: '#fff4a8',
    }),
    look: (l) => ({...l, ink: '#111111'}),
  },
};
