import React, {useId} from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgLayer} from '../lib/SvgLayer';
import {HEIGHT, WIDTH, mod} from '../lib/theme';
import {usePalette} from '../lib/palettes';
import {groundY} from './terrain';

/** A clay lamp with a flickering flame. (x, y) = bottom centre of the lamp. */
export const Diya: React.FC<{x: number; y: number; scale?: number; seed?: number}> = ({x, y, scale = 1, seed = 0}) => {
  const p = usePalette();
  const id = useId().replace(/:/g, '');
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const flick = 1 + 0.12 * Math.sin(t * 11 + seed * 2.3) + 0.07 * Math.sin(t * 17.3 + seed);
  const lean = 3 * Math.sin(t * 6 + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={p.glow} stopOpacity={0.75} />
          <stop offset="1" stopColor={p.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={0} cy={-34} r={90 * flick} fill={`url(#${id})`} />
      <path d="M -30 -22 Q 0 12 30 -22 Q 38 -28 30 -30 L -30 -30 Q -38 -28 -30 -22 Z" fill="#c4622d" stroke={p.ink} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M 0 -32 Q ${-12 + lean} ${-52 * flick} ${lean} ${-78 * flick} Q ${14 + lean} ${-52 * flick} 0 -32 Z`} fill="#ffb347" />
      <path d={`M 0 -32 Q ${-5 + lean / 2} ${-44 * flick} ${lean / 2} ${-58 * flick} Q ${6 + lean / 2} ${-44 * flick} 0 -32 Z`} fill="#fff3b0" />
    </g>
  );
};

/** A line of diyas standing on the front hill, scrolling with it. */
export const DiyaTrail: React.FC<{scroll: number; spacing?: number; scale?: number}> = ({scroll, spacing = 330, scale = 1}) => {
  const span = WIDTH + spacing * 2;
  const n = Math.ceil(span / spacing) + 1;
  const first = Math.floor(scroll / spacing);
  return (
    <SvgLayer>
      {Array.from({length: n}, (_, k) => {
        const idx = first + k;
        const sx = idx * spacing - scroll;
        return <Diya key={idx} x={sx} y={groundY(sx, scroll) + 8} scale={scale} seed={idx} />;
      })}
    </SvgLayer>
  );
};

/** Glowing sparks rising from a point (a lamp, a fire, a blessing). */
export const Sparks: React.FC<{x: number; y: number; count?: number; spread?: number; rise?: number; color?: string; seed?: string}> = ({
  x,
  y,
  count = 26,
  spread = 140,
  rise = 420,
  color,
  seed = 'sparks',
}) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <SvgLayer>
      {Array.from({length: count}, (_, i) => {
        const life = 1.2 + random(`${seed}l${i}`) * 1.4;
        const u = mod(t / life + random(`${seed}o${i}`), 1);
        const dx = (random(`${seed}d${i}`) - 0.5) * 2 * spread * u + Math.sin(u * 9 + i) * 14;
        const dy = -rise * u * (0.6 + random(`${seed}r${i}`) * 0.6);
        const r = (1.8 + random(`${seed}s${i}`) * 3.4) * (1 - u * 0.7);
        return <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={color ?? p.glow} opacity={(1 - u) * 0.95} />;
      })}
    </SvgLayer>
  );
};

/** Petals falling and swaying over the whole frame. */
export const Petals: React.FC<{count?: number; colors?: string[]; seed?: string}> = ({
  count = 22,
  colors = ['#ff7aa8', '#ffb347', '#ffd1e0', '#ff5d8f'],
  seed = 'petals',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <SvgLayer>
      {Array.from({length: count}, (_, i) => {
        const fall = 70 + random(`${seed}f${i}`) * 90; // px/s
        const size = 0.6 + random(`${seed}z${i}`) * 0.8;
        const y = mod(random(`${seed}y${i}`) * (HEIGHT + 300) + fall * t, HEIGHT + 300) - 150;
        const x = random(`${seed}x${i}`) * WIDTH + Math.sin(t * (0.9 + random(`${seed}w${i}`)) + i) * 60;
        const rot = random(`${seed}r${i}`) * 360 + t * (40 + random(`${seed}q${i}`) * 90);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`} opacity={0.9}>
            <path d="M 0 -16 Q 12 -2 0 16 Q -12 -2 0 -16 Z" fill={colors[i % colors.length]} />
          </g>
        );
      })}
    </SvgLayer>
  );
};
