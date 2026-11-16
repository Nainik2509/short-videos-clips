import React, {useId} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {Palette} from '../lib/palettes';
import type {CharacterLook} from '../rig';
import {HEIGHT, WIDTH} from '../lib/theme';

/**
 * A style is the "one look per series": palette, how characters are coloured, a finishing
 * overlay, and how many drawings per second the animation uses. Pick one in story.json ("style").
 * These are presets: refine any of them here and every story using that style updates.
 */
export type StyleName = 'flat' | 'paperCutout' | 'shadowPuppet' | 'madhubani' | 'stainedGlass' | 'warli' | 'glowLine' | 'stickTales';

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
const fill = (inset = 0): React.CSSProperties => ({position: 'absolute', inset, pointerEvents: 'none'});

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

/** Warm lamp behind a cloth screen: flickering glow plus dark vignette. */
const LampGlow: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = 0.9 + 0.1 * Math.sin(f * 0.7) * Math.sin(f * 0.23);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...fill(), background: `radial-gradient(ellipse at 50% 55%, rgba(255,190,90,${0.28 * flicker}) 0%, rgba(0,0,0,0) 55%, rgba(20,6,0,0.7) 100%)`}} />
    </AbsoluteFill>
  );
};

const TriangleRow: React.FC<{y: number; color: string; size?: number}> = ({y, color, size = 30}) => {
  const n = Math.ceil(WIDTH / size);
  return (
    <svg width={WIDTH} height={HEIGHT} style={fill()}>
      {Array.from({length: n}, (_, i) => (
        <path key={i} d={`M ${i * size} ${y + size} L ${i * size + size / 2} ${y} L ${(i + 1) * size} ${y + size} Z`} fill={color} />
      ))}
    </svg>
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

const WarliBorder: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <TriangleRow y={70} color="#f4ead8" />
    <TriangleRow y={HEIGHT - 100} color="#f4ead8" />
  </AbsoluteFill>
);

/** Arched window with a dark wooden frame, lead lines and a sweep of sunlight. */
const StainedGlassFrame: React.FC = () => {
  const f = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  const sweep = ((f * 5) % (WIDTH * 2.4)) - WIDTH * 0.7;
  const x0 = 60;
  const x1 = WIDTH - 60;
  const arcTop = 160;
  const r = (x1 - x0) / 2;
  const arch = `M ${x0} ${HEIGHT - 60} L ${x0} ${arcTop + r} A ${r} ${r} 0 0 1 ${x1} ${arcTop + r} L ${x1} ${HEIGHT - 60} Z`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={WIDTH} height={HEIGHT}>
        <defs>
          <pattern id={`${id}-lead`} width={90} height={90} patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <path d="M 0 0 H 90 M 0 0 V 90" stroke="#0b0a14" strokeWidth={7} opacity={0.75} />
          </pattern>
          <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff2b0" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff2b0" stopOpacity={0.35} />
            <stop offset="1" stopColor="#fff2b0" stopOpacity={0} />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <path d={arch} />
          </clipPath>
        </defs>
        <path d={`M 0 0 H ${WIDTH} V ${HEIGHT} H 0 Z ${arch}`} fill="#2a1608" fillRule="evenodd" />
        <path d={arch} fill="none" stroke="#d9a63a" strokeWidth={14} />
        <g clipPath={`url(#${id}-clip)`}>
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-lead)`} />
          <rect x={sweep} y={0} width={260} height={HEIGHT} fill={`url(#${id}-sun)`} transform={`skewX(-18)`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- looks ----------

const warliLook = (l: CharacterLook): CharacterLook => ({
  ...l,
  skin: '#f4ead8',
  hair: '#f4ead8',
  top: '#f4ead8',
  bottom: '#f4ead8',
  accent: '#f4ead8',
  shoe: '#f4ead8',
  ink: '#6b2a10',
});

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
  shadowPuppet: {
    label: 'Shadow puppet',
    note: 'Leather puppets on a lamp-lit cloth screen (Tholu Bommalata): amber glow, dark outlines, 10 drawings a second.',
    drawingsPerSec: 10,
    palette: (p) => ({
      ...p,
      skyTop: '#2b1200',
      skyMid: '#8a3c0a',
      skyBottom: '#f5a623',
      stars: 0,
      hills: ['#6b2c07', '#4a1d04', '#2a1002'],
      cloud: '#ffb347',
      leaf: ['#2a1002', '#3b1805'],
      trunk: '#140700',
      ink: '#1a0a00',
      glow: '#ffd36b',
    }),
    look: (l) => ({...l, ink: '#1a0a00'}),
    filter: 'sepia(0.35) saturate(1.3) contrast(1.05)',
    Overlay: LampGlow,
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
  stainedGlass: {
    label: 'Stained glass',
    note: 'A temple window of jewel colours: arch frame, gold trim, lead lines and a sweep of sunlight.',
    drawingsPerSec: 0,
    palette: (p) => ({
      ...p,
      skyTop: '#1b2a7a',
      skyMid: '#7a1d63',
      skyBottom: '#e0a21a',
      stars: 0,
      hills: ['#1d7a4a', '#0f5f8f', '#8f1d2f'],
      cloud: '#e0a21a',
      leaf: ['#1d7a4a', '#2aa05f'],
      trunk: '#2a1608',
      ink: '#0b0a14',
      glow: '#ffd66b',
    }),
    look: (l) => ({...l, ink: '#0b0a14'}),
    filter: 'saturate(1.25)',
    Overlay: StainedGlassFrame,
  },
  warli: {
    label: 'Warli',
    note: 'Maharashtra tribal art: off-white figures on a terracotta wall, triangle borders, slightly rough.',
    drawingsPerSec: 8,
    palette: (p) => ({
      ...p,
      skyTop: '#b5532a',
      skyMid: '#b5532a',
      skyBottom: '#b5532a',
      stars: 0,
      hills: ['#a34a24', '#944220', '#843a1c'],
      cloud: '#c96a3a',
      leaf: ['#f4ead8', '#e6d8bd'],
      trunk: '#f4ead8',
      ink: '#6b2a10',
      glow: '#f4ead8',
    }),
    look: warliLook,
    Overlay: WarliBorder,
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

export const styleNames = Object.keys(styles) as StyleName[];
