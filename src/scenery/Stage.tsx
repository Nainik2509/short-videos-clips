import React from 'react';
import {Easing, interpolate} from 'remotion';
import {languages} from '../lib/languages';
import type {Language} from '../lib/languages';
import {INK, pop} from './stageKit';

/**
 * Explainer props for Stick Tales (and any story): things to point at (panes, arrows, labels, fog, word cards,
 * bottle, crowns, bathhouse, a hopping word, oil drops).
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
// ---- extra props: word card, bottle, crown, bathhouse, hopping word, oil drops ----
type CardItem = Base & {
  type: 'card';
  x: number;
  y: number;
  w?: number;
  lines: {text: string; size?: number; color?: string}[];
  color?: string;
  language?: Language;
};
type BottleItem = Base & {type: 'bottle'; x: number; y: number; scale?: number};
type CrownItem = Base & {type: 'crown'; x: number; y: number; scale?: number; tilt?: number};
type HouseItem = Base & {type: 'house'; x: number; y: number; scale?: number; sign?: string};
type HopItem = Base & {
  type: 'hop';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  /** seconds the word takes to travel */
  over?: number;
  size?: number;
};
type DropsItem = Base & {type: 'drops'; x: number; y: number};
type PropItem = CardItem | BottleItem | CrownItem | HouseItem | HopItem | DropsItem;

export type StageItem = PanesItem | ArrowsItem | LabelItem | FogItem | PropItem;

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

const Card: React.FC<{item: CardItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const w = item.w ?? 780;
  const gap = 18;
  const heights = item.lines.map((l) => (l.size ?? 80) * 1.15);
  const h = heights.reduce((a, b) => a + b, 0) + gap * (item.lines.length - 1) + 80;
  let y = -h / 2 + 40;
  return (
    <g transform={`translate(${item.x} ${item.y}) scale(${0.6 + 0.4 * s})`} opacity={Math.min(1, s)}>
      <rect x={-w / 2 + 12} y={-h / 2 + 14} width={w} height={h} rx={44} fill={INK} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill={item.color ?? '#ffffff'} stroke={INK} strokeWidth={8} />
      {item.lines.map((l, i) => {
        const size = l.size ?? 80;
        const base = y + size * 0.88;
        y += heights[i] + gap;
        return (
          <text key={i} x={0} y={base} textAnchor="middle" fontFamily={languages[item.language ?? 'english'].font} fontWeight={800} fontSize={size} fill={l.color ?? INK}>
            {l.text}
          </text>
        );
      })}
    </g>
  );
};

const Bottle: React.FC<{item: BottleItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const t = frame / fps;
  const bob = Math.sin(t * 3) * 6;
  return (
    <g transform={`translate(${item.x} ${item.y + bob}) scale(${(item.scale ?? 1) * s})`}>
      <rect x={-26} y={-200} width={52} height={50} fill="#ffd45e" stroke={INK} strokeWidth={8} />
      <rect x={-38} y={-250} width={76} height={56} rx={12} fill="#2f6bff" stroke={INK} strokeWidth={8} />
      <rect x={-70} y={-160} width={140} height={270} rx={34} fill="#ff7ab6" stroke={INK} strokeWidth={8} />
      <rect x={-48} y={-80} width={96} height={110} rx={14} fill="#fff" stroke={INK} strokeWidth={6} />
      <path d="M -30 -30 Q -10 -56 10 -30 T 30 -30" fill="none" stroke="#2f6bff" strokeWidth={8} strokeLinecap="round" />
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.7 + i / 3) % 1);
        return <circle key={i} cx={-70 + i * 70} cy={-270 - p * 90} r={12 + i * 3} fill="#fff" stroke={INK} strokeWidth={4} opacity={1 - p} />;
      })}
    </g>
  );
};

const Crown: React.FC<{item: CrownItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const bob = Math.sin((frame / fps) * 3 + item.x) * 5;
  return (
    <g transform={`translate(${item.x} ${item.y + bob}) rotate(${item.tilt ?? 0}) scale(${(item.scale ?? 1) * s})`}>
      <path d="M -90 40 L -100 -50 L -45 0 L 0 -70 L 45 0 L 100 -50 L 90 40 Z" fill="#ffd45e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-94} y={34} width={188} height={34} rx={12} fill="#ffb347" stroke={INK} strokeWidth={8} />
      <circle cx={0} cy={-76} r={12} fill="#ff3b5c" stroke={INK} strokeWidth={5} />
      <circle cx={-100} cy={-56} r={11} fill="#2f6bff" stroke={INK} strokeWidth={5} />
      <circle cx={100} cy={-56} r={11} fill="#2f6bff" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const House: React.FC<{item: HouseItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const t = frame / fps;
  return (
    <g transform={`translate(${item.x} ${item.y}) scale(${(item.scale ?? 1) * s})`}>
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.5 + i / 3) % 1);
        return <circle key={i} cx={100 + Math.sin(p * 6 + i) * 16} cy={-250 - p * 120} r={22 + p * 18} fill="#fff" stroke={INK} strokeWidth={5} opacity={0.9 - p * 0.8} />;
      })}
      <rect x={70} y={-250} width={50} height={90} fill="#c97a4a" stroke={INK} strokeWidth={8} />
      <rect x={-160} y={-120} width={320} height={210} fill="#ffe0b2" stroke={INK} strokeWidth={8} />
      <path d="M -190 -116 L 0 -260 L 190 -116 Z" fill="#e4572e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {item.sign && (
        <>
          <rect x={-136} y={-100} width={272} height={54} rx={14} fill="#fff" stroke={INK} strokeWidth={6} />
          <text x={0} y={-60} textAnchor="middle" fontFamily={languages.english.font} fontWeight={800} fontSize={36} fill={INK}>
            {item.sign}
          </text>
        </>
      )}
      <rect x={-40} y={0} width={80} height={90} rx={10} fill="#2f6bff" stroke={INK} strokeWidth={6} />
      <rect x={70} y={-10} width={60} height={56} rx={8} fill="#cfeffc" stroke={INK} strokeWidth={6} />
      <rect x={-130} y={-10} width={60} height={56} rx={8} fill="#cfeffc" stroke={INK} strokeWidth={6} />
    </g>
  );
};

const Hop: React.FC<{item: HopItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {s, visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const start = Math.round((item.at ?? 0) * fps) + 10;
  const p = interpolate(frame, [start, start + (item.over ?? 2.5) * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const cx = (item.x1 + item.x2) / 2;
  const cy = Math.min(item.y1, item.y2) - 300;
  const bx = (1 - p) * (1 - p) * item.x1 + 2 * (1 - p) * p * cx + p * p * item.x2;
  const by = (1 - p) * (1 - p) * item.y1 + 2 * (1 - p) * p * cy + p * p * item.y2;
  const size = item.size ?? 54;
  const width = item.text.length * size * 0.58 + 60;
  return (
    <g opacity={Math.min(1, s)}>
      <path d={`M ${item.x1} ${item.y1} Q ${cx} ${cy} ${item.x2} ${item.y2}`} fill="none" stroke={INK} strokeWidth={8} strokeDasharray="4 24" strokeLinecap="round" />
      <circle cx={item.x1} cy={item.y1} r={28} fill="#ffd45e" stroke={INK} strokeWidth={8} />
      <circle cx={item.x2} cy={item.y2} r={28} fill="#5fe3d4" stroke={INK} strokeWidth={8} />
      <g transform={`translate(${bx} ${by - 20}) scale(${1 + 0.1 * Math.sin(p * Math.PI * 6)})`}>
        <rect x={-width / 2} y={-size * 0.85} width={width} height={size * 1.7} rx={size * 0.5} fill="#ff7ab6" stroke={INK} strokeWidth={6} />
        <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={languages.english.font} fontWeight={800} fontSize={size} fill={INK}>
          {item.text}
        </text>
      </g>
    </g>
  );
};

const Drops: React.FC<{item: DropsItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  const {visible} = pop(frame, fps, item.at);
  if (!visible) return null;
  const t = frame / fps;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const p = (t * 0.9 + i / 3) % 1;
        return (
          <path key={i} transform={`translate(${item.x + (i - 1) * 46} ${item.y + p * 90}) scale(${0.9})`} d="M 0 -26 Q 18 4 0 18 Q -18 4 0 -26 Z" fill="#ffb347" stroke={INK} strokeWidth={5} opacity={1 - p * 0.9} />
        );
      })}
    </g>
  );
};

/** Draws one of the extra props (card, bottle, crown, house, hop, drops). */
const PropShape: React.FC<{item: PropItem; frame: number; fps: number}> = ({item, frame, fps}) => {
  switch (item.type) {
    case 'card':
      return <Card item={item} frame={frame} fps={fps} />;
    case 'bottle':
      return <Bottle item={item} frame={frame} fps={fps} />;
    case 'crown':
      return <Crown item={item} frame={frame} fps={fps} />;
    case 'house':
      return <House item={item} frame={frame} fps={fps} />;
    case 'hop':
      return <Hop item={item} frame={frame} fps={fps} />;
    case 'drops':
      return <Drops item={item} frame={frame} fps={fps} />;
  }
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
