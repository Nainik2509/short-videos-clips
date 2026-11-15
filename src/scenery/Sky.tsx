import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgLayer} from '../lib/SvgLayer';
import {HEIGHT, WIDTH} from '../lib/theme';
import {usePalette} from '../lib/palettes';

export type SunProps = {x: number; y: number; r?: number};

/** Gradient sky, twinkling stars (visibility comes from the palette) and an optional sun. */
export const Sky: React.FC<{sun?: SunProps; starCount?: number; seed?: string}> = ({sun, starCount = 80, seed = 'sky'}) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const stars = Array.from({length: starCount}, (_, i) => ({
    x: random(`${seed}x${i}`) * WIDTH,
    y: random(`${seed}y${i}`) * HEIGHT * 0.55,
    r: 1.4 + random(`${seed}r${i}`) * 3.2,
    tw: 0.6 + random(`${seed}t${i}`) * 1.6,
    ph: random(`${seed}p${i}`) * Math.PI * 2,
  }));

  return (
    <SvgLayer>
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="0.5" stopColor={p.skyMid} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <radialGradient id="sun-glow">
          <stop offset="0" stopColor={p.glow} stopOpacity={0.9} />
          <stop offset="1" stopColor={p.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#sky-grad)" />
      {p.stars > 0 &&
        stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={p.stars * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.tw * 2 + s.ph)))} />
        ))}
      {sun && (
        <g>
          <circle cx={sun.x} cy={sun.y} r={(sun.r ?? 90) * 3.2} fill="url(#sun-glow)" />
          <circle cx={sun.x} cy={sun.y} r={sun.r ?? 90} fill={p.glow} />
        </g>
      )}
    </SvgLayer>
  );
};

/** Crescent / full moon. phase: 0 = full, up to ~0.8 = thin crescent. */
export const Moon: React.FC<{x: number; y: number; r?: number; phase?: number}> = ({x, y, r = 80, phase = 0.35}) => {
  return (
    <SvgLayer>
      <defs>
        <radialGradient id="moon-glow">
          <stop offset="0" stopColor="#fff6d6" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff6d6" stopOpacity={0} />
        </radialGradient>
        <mask id="moon-mask">
          <rect width={WIDTH} height={HEIGHT} fill="#fff" />
          <circle cx={x + r * phase * 1.3} cy={y - r * phase * 0.35} r={r * (phase > 0 ? 0.92 : 0)} fill="#000" />
        </mask>
      </defs>
      <circle cx={x} cy={y} r={r * 2.8} fill="url(#moon-glow)" />
      <circle cx={x} cy={y} r={r} fill="#fff6d6" mask="url(#moon-mask)" />
    </SvgLayer>
  );
};
