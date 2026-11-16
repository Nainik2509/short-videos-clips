import React from 'react';
import {interpolate, spring} from 'remotion';
import {languages} from '../lib/languages';
import type {Language} from '../lib/languages';
import {PropShape, type PropItem} from './StageProps';

/**
 * Explainer props for Stick Tales (and any story): things to point at.
 * Listed per scene in story.json under "stage"; positions are screen pixels (1080x1920).
 * `at` = seconds into the scene when the item pops in (default 0). Everything animates from the frame only.
 */
type Base = {at?: number};
export type PanesItem = Base & {
  type: 'panes';
  x: number;
  y: number;
  /** pane height, default 520 */
  h?: number;
  /** show the tiny breather hole in the middle pane */
  hole?: boolean;
  /** glow one part */
  highlight?: 'outer' | 'middle' | 'inner' | 'hole';
  /** draw a crack in this pane */
  crack?: 'outer' | 'middle' | 'inner';
  /** draw "outside" and "cabin" tints either side */
  sides?: boolean;
};
export type ArrowsItem = Base & {
  type: 'arrows';
  x: number;
  y: number;
  /** degrees, 0 = pointing right, 90 = down */
  angle?: number;
  count?: number;
  size?: number;
  color?: string;
};
export type LabelItem = Base & {
  type: 'label';
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  textColor?: string;
  language?: Language;
};
export type FogItem = Base & {
  type: 'fog';
  x: number;
  y: number;
  w: number;
  h: number;
  /** wipe clear over this many seconds starting at `at` (omit: stays foggy) */
  clearOver?: number;
};
export type StageItem = PanesItem | ArrowsItem | LabelItem | FogItem | PropItem;

const INK = '#111111';
const pop = (frame: number, fps: number, at = 0) => {
  const s = spring({frame: frame - Math.round(at * fps), fps, config: {damping: 12, stiffness: 160}, durationInFrames: 18});
  return {s, visible: frame >= Math.round(at * fps)};
};

const Panes: React.FC<{item: PanesItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const h = item.h ?? 520;
  const gap = 100; // between panes
  const w = 34;
  const holeY = h * 0.22;
  const holeH = 26;
  const glow = 0.55 + 0.45 * Math.sin((frame / fps) * Math.PI * 4);
  const pane = (name: 'outer' | 'middle' | 'inner', cx: number) => {
    const lit = item.highlight === name;
    const hasHole = name === 'middle' && item.hole;
    const fill = lit ? '#ffe36b' : '#cfeffc';
    const stroke = {fill, stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const};
    const top = -h / 2;
    return (
      <g key={name}>
        {lit && <rect x={cx - w / 2 - 14} y={top - 14} width={w + 28} height={h + 28} rx={22} fill="#ffe36b" opacity={0.35 * glow + 0.15} />}
        {hasHole ? (
          <>
            <rect x={cx - w / 2} y={top} width={w} height={holeY - holeH / 2 - top} rx={8} {...stroke} />
            <rect x={cx - w / 2} y={holeY + holeH / 2} width={w} height={h / 2 - holeY - holeH / 2} rx={8} {...stroke} />
          </>
        ) : (
          <rect x={cx - w / 2} y={top} width={w} height={h} rx={10} {...stroke} />
        )}
        {item.crack === name && (
          <path d={`M ${cx - w / 2 - 4} ${-h * 0.12} L ${cx + 2} ${-h * 0.04} L ${cx - 6} ${h * 0.04} L ${cx + w / 2 + 4} ${h * 0.12}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </g>
    );
  };
  const holeLit = item.highlight === 'hole' && item.hole;
  return (
    <g transform={`translate(${item.x} ${item.y}) scale(${0.6 + 0.4 * s})`} opacity={Math.min(1, s)}>
      {item.sides && (
        <>
          <rect x={-gap - 130} y={-h / 2 - 30} width={130 + gap - 40} height={h + 60} rx={28} fill="#9ad8ff" opacity={0.55} />
          <rect x={gap + 40} y={-h / 2 - 30} width={130 + gap - 40} height={h + 60} rx={28} fill="#ffd59a" opacity={0.6} />
        </>
      )}
      <rect x={-gap - w} y={-h / 2 - 28} width={2 * gap + 2 * w} height={30} rx={10} fill="#9aa3ad" stroke={INK} strokeWidth={6} />
      <rect x={-gap - w} y={h / 2 - 2} width={2 * gap + 2 * w} height={30} rx={10} fill="#9aa3ad" stroke={INK} strokeWidth={6} />
      {pane('outer', -gap)}
      {pane('middle', 0)}
      {pane('inner', gap)}
      {holeLit && <circle cx={0} cy={holeY} r={34 + 8 * glow} fill="none" stroke="#ff3b5c" strokeWidth={8} />}
    </g>
  );
};

const Arrows: React.FC<{item: ArrowsItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const n = item.count ?? 3;
  const size = item.size ?? 1;
  const color = item.color ?? '#ff3b5c';
  const pulse = 14 * Math.sin((frame / fps) * Math.PI * 3);
  return (
    <g transform={`translate(${item.x} ${item.y}) rotate(${item.angle ?? 0}) scale(${size * s})`}>
      {Array.from({length: n}, (_, i) => {
        const y = (i - (n - 1) / 2) * 78;
        return (
          <g key={i} transform={`translate(${pulse} ${y})`}>
            <path d="M -70 -14 H 20 V -40 L 78 0 L 20 40 V 14 H -70 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

const Label: React.FC<{item: LabelItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const size = item.size ?? 54;
  const width = item.text.length * size * 0.56 + 56;
  return (
    <g transform={`translate(${item.x} ${item.y}) scale(${s})`}>
      <rect x={-width / 2} y={-size * 0.85} width={width} height={size * 1.7} rx={size * 0.5} fill={item.color ?? '#ffd45e'} stroke={INK} strokeWidth={6} />
      <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={languages[item.language ?? 'english'].font} fontWeight={800} fontSize={size} fill={item.textColor ?? INK}>
        {item.text}
      </text>
    </g>
  );
};

const Fog: React.FC<{item: FogItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const start = Math.round((item.at ?? 0) * fps);
  const clear = item.clearOver ? interpolate(frame, [start, start + item.clearOver * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const wipeX = item.x - item.w / 2 + item.w * clear;
  const blobs = Array.from({length: 7}, (_, i) => ({cx: item.x - item.w / 2 + (item.w * (i + 0.5)) / 7, cy: item.y + Math.sin(i * 2.1) * item.h * 0.18, r: item.h * (0.42 + 0.06 * Math.sin(i * 1.7))}));
  return (
    <g>
      <clipPath id={`fog-${item.x}-${item.y}`}>
        <rect x={wipeX} y={item.y - item.h} width={Math.max(0, item.x + item.w / 2 - wipeX)} height={item.h * 2} />
      </clipPath>
      <g clipPath={`url(#fog-${item.x}-${item.y})`} opacity={0.88}>
        {blobs.map((b, i) => (
          <circle key={i} {...b} fill="#f3f6f8" />
        ))}
      </g>
    </g>
  );
};

/** Draws a scene's stage items. Put it inside an <SvgLayer>. */
export const StageItems: React.FC<{items: StageItem[]; frame: number; fps: number}> = ({items, frame, fps}) => (
  <>
    {items.map((item, i) => {
      switch (item.type) {
        case 'panes':
          return <Panes key={i} item={item} frame={frame} fps={fps} />;
        case 'arrows':
          return <Arrows key={i} item={item} frame={frame} fps={fps} />;
        case 'label':
          return <Label key={i} item={item} frame={frame} fps={fps} />;
        case 'fog':
          return <Fog key={i} item={item} frame={frame} fps={fps} />;
        default:
          return <PropShape key={i} item={item} frame={frame} fps={fps} />;
      }
    })}
  </>
);
