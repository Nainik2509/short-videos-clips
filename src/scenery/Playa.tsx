import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {usePalette} from '../lib/palettes';
import {groundY} from './terrain';

/**
 * Desert-playa props for science and mystery stories: a rock, the trail it leaves, a GPS beacon
 * and floating ice panels. All are SVG groups; draw them inside an <SvgLayer>.
 */

/** A rock standing on the ground at screen x. (x, y) = bottom centre. */
export const Rock: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => {
  const p = usePalette();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={4} cy={6} rx={92} ry={14} fill="#000" opacity={0.28} />
      <path d="M -72 4 C -86 -34 -52 -78 -4 -84 C 44 -90 84 -52 76 -6 C 74 10 40 14 0 14 C -40 14 -70 12 -72 4 Z" fill="#7d6a78" stroke={p.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -52 -40 C -34 -66 4 -74 30 -66" fill="none" stroke="#b6a3b2" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
      <path d="M 20 -10 C 38 -20 52 -30 58 -44" fill="none" stroke="#54455a" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

/** The long scratch a rock leaves in the mud, from fromX to toX (screen px), following the ground. */
export const RockTrail: React.FC<{fromX: number; toX: number; scroll: number}> = ({fromX, toX, scroll}) => {
  const p = usePalette();
  // pale scratches on dark night ground, dark scratches on light dawn ground
  const scratch = p.stars > 0.5 ? '#B5A6CC' : p.ink;
  const lo = Math.min(fromX, toX);
  const hi = Math.max(fromX, toX);
  if (hi - lo < 4) return null;
  const pts: string[] = [];
  const pts2: string[] = [];
  for (let x = lo; x <= hi; x += 16) {
    const y = groundY(x, scroll) + 14 + 3 * Math.sin(x / 38);
    pts.push(`${x.toFixed(0)},${y.toFixed(1)}`);
    pts2.push(`${x.toFixed(0)},${(y + 12).toFixed(1)}`);
  }
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.75}>
      <polyline points={pts.join(' ')} stroke={scratch} strokeWidth={9} />
      <polyline points={pts2.join(' ')} stroke={scratch} strokeWidth={5} opacity={0.6} />
    </g>
  );
};

/** A glowing GPS marker on top of a rock, with rings that ping outward. */
export const GpsBeacon: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (frame / fps) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0, 0.5].map((o, i) => {
        const u = (t + o) % 1;
        return <circle key={i} cx={0} cy={0} r={14 + u * 70} fill="none" stroke="#2EC4B6" strokeWidth={5} opacity={(1 - u) * 0.9} />;
      })}
      <circle cx={0} cy={0} r={12} fill="#2EC4B6" stroke="#0E0A33" strokeWidth={4} />
      <circle cx={-3} cy={-3} r={4} fill="#fff" opacity={0.85} />
    </g>
  );
};

/** A thin pane of ice floating on a shallow pond. (x, y) = centre on the ground. */
export const IcePanel: React.FC<{x: number; y: number; scale?: number; flip?: boolean}> = ({x, y, scale = 1, flip = false}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
    <path d="M -190 12 L -100 -12 L 130 -8 L 210 14 L 100 34 L -130 30 Z" fill="#CFF1FF" fillOpacity={0.62} stroke="#FFFFFF" strokeWidth={4} strokeOpacity={0.9} strokeLinejoin="round" />
    <path d="M -120 8 L -40 -4 M 20 4 L 110 6 M -60 20 L 40 22" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.7} fill="none" />
  </g>
);
