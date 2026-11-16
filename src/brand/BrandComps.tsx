import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaletteProvider, palettes} from '../lib/palettes';
import {Character, looks} from '../rig';
import {AuroraSvg, CREAM, ClayDefs, ClayMark, MARIGOLD, PINK, TEAL, ramp} from './ClayMark';

const FONT = "'Arial Rounded MT Bold', 'Avenir Next Rounded', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const FONT_MIX = `${FONT}, "Noto Sans Devanagari", "Kohinoor Devanagari", "Devanagari Sangam MN", sans-serif`;

/** 800x800 profile picture. YouTube crops it to a circle, so the mark sits well inside. */
export const LogoStill: React.FC = () => (
  <AbsoluteFill style={{background: '#120A47'}}>
    <div style={{transform: 'translateY(-6px) scale(1.12)'}}>
      <ClayMark background />
    </div>
  </AbsoluteFill>
);

/** Transparent 800x800 mark for the video watermark (brand.mjs scales it down to 300x300). */
export const WatermarkStill: React.FC = () => <ClayMark />;

/** Extruded 3D lettering: a dark stack of offset copies behind a glossy top face. */
const extrude = (depth: number, color: string, dx = 0.55, dy = 1) =>
  Array.from({length: depth}, (_, i) => `${(i + 1) * dx}px ${(i + 1) * dy}px 0 ${color}`)
    .concat(`${depth * dx + 6}px ${depth * dy + 22}px 38px rgba(6,3,30,0.55)`)
    .join(', ');

const Letter: React.FC<{ch: string; size: number; top: string; bottom: string; side: string; style?: React.CSSProperties}> = ({ch, size, top, bottom, side, style}) => (
  <span style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre', ...style}}>
    <span aria-hidden style={{position: 'absolute', left: 0, top: 0, color: side, textShadow: extrude(Math.round(size / 9), side)}}>{ch}</span>
    <span style={{position: 'relative', backgroundImage: `linear-gradient(180deg, ${top} 0%, ${top} 30%, ${bottom} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{ch}</span>
  </span>
);

const Title3D: React.FC<{text: string; size: number; top: string; bottom: string; side: string; frame?: number; from?: number}> = ({text, size, top, bottom, side, frame, from = 0}) => (
  <span style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -size / 40, display: 'inline-flex'}}>
    {[...text].map((ch, i) => {
      if (frame === undefined) return <Letter key={i} ch={ch} size={size} top={top} bottom={bottom} side={side} />;
      const p = Easing.out(Easing.back(2.2))(ramp(frame, from + i * 2.5, from + i * 2.5 + 16));
      return <Letter key={i} ch={ch} size={size} top={top} bottom={bottom} side={side} style={{opacity: ramp(frame, from + i * 2.5, from + i * 2.5 + 6), transform: `translateY(${(1 - p) * 80}px) scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -8}deg)`}} />;
    })}
  </span>
);

/** The three languages as frosted-glass pills with a colour dot. */
const LANGS: {label: string; dot: string}[] = [
  {label: 'English', dot: TEAL},
  {label: 'हिन्दी', dot: MARIGOLD},
  {label: 'Hinglish', dot: PINK},
];
const GlassChips: React.FC<{size: number; gap: number; opacity?: number}> = ({size, gap, opacity = 1}) => (
  <div style={{display: 'flex', gap, opacity}}>
    {LANGS.map((l) => (
      <div key={l.label} style={{display: 'flex', alignItems: 'center', gap: size * 0.38, fontFamily: FONT_MIX, fontWeight: 800, fontSize: size, lineHeight: 1, color: '#fff', padding: `${size * 0.32}px ${size * 0.8}px ${size * 0.32}px ${size * 0.55}px`, borderRadius: 999, background: 'linear-gradient(180deg, rgba(255,255,255,0.30), rgba(255,255,255,0.10))', border: `${Math.max(2, size / 16)}px solid rgba(255,255,255,0.45)`, boxShadow: `inset 0 ${size / 14}px 0 rgba(255,255,255,0.45), 0 ${size * 0.35}px ${size * 0.7}px rgba(8,4,40,0.35)`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)'}}>
        <span style={{width: size * 0.55, height: size * 0.55, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #fff, ${l.dot} 55%)`, boxShadow: `0 0 ${size * 0.5}px ${l.dot}`}} />
        {l.label}
      </div>
    ))}
  </div>
);

const Stars: React.FC<{n: number; w: number; h: number; seconds?: number}> = ({n, w, h, seconds = 0}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: n}, (_, i) => (
      <circle key={i} cx={random(`bx${i}`) * w} cy={random(`by${i}`) * h * 0.75} r={1.2 + random(`br${i}`) * 3.2} fill="#fff" opacity={(0.25 + 0.6 * random(`bo${i}`)) * (0.7 + 0.3 * Math.sin(seconds * 2.5 + i))} />
    ))}
  </svg>
);

/** 4-second animated logo for the start or end of a Short: aurora, the clay book inflates, the spark rises, the name pops in. */
export const LogoSting: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const tilt = 10 * Math.sin(frame / 20);
  const lift = interpolate(frame, [0, 26], [70, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const tagline = ramp(frame, 86, 106);
  const chips = ramp(frame, 98, 116);
  const glare = ramp(frame, 74, 112);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#0B0733'}}>
      <AuroraSvg w={1080} h={1920} seconds={seconds} id="st" />
      <Stars n={46} w={1080} h={1920} seconds={seconds} />
      <div style={{position: 'absolute', left: 120, top: 190 + lift, width: 840, height: 840, perspective: 1800}}>
        <div style={{transform: `rotateY(${tilt}deg) rotateX(${-tilt / 4}deg)`, transformStyle: 'preserve-3d'}}>
          <ClayMark size={840} progress={ramp(frame, 0, 56)} seconds={seconds} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center'}}>
        <Title3D text="Doodle" size={190} top="#FFFFFF" bottom="#FFE9C0" side="#3A1FA6" frame={frame} from={46} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center'}}>
        <Title3D text="Story Tales" size={190} top="#FFE27A" bottom="#FF9A1F" side="#3A1FA6" frame={frame} from={60} />
      </div>
      {/* a glare sweeping over the title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, height: 400, overflow: 'hidden', mixBlendMode: 'soft-light', opacity: 0.9 * Math.sin(glare * Math.PI)}}>
        <div style={{position: 'absolute', top: -40, bottom: -40, width: 160, left: -200 + glare * 1500, background: 'linear-gradient(90deg, transparent, #fff, transparent)', transform: 'skewX(-20deg)'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center', fontFamily: FONT, fontSize: 56, fontWeight: 800, color: CREAM, opacity: tagline, transform: `translateY(${(1 - tagline) * 16}px)`, textShadow: '0 6px 20px rgba(6,3,30,0.5)'}}>
        Stories · Facts · Cartoons
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1590, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - chips) * 24}px)`}}>
        <GlassChips size={46} gap={22} opacity={chips} />
      </div>
    </AbsoluteFill>
  );
};

/** A clay podium disc a character stands on. (x, y) is the centre of the top face. */
const Podium: React.FC<{x: number; y: number; r: number; top: string; side: string; fid: string}> = ({x, y, r, top, side, fid}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={58} rx={r * 1.05} ry={r * 0.3} fill="#07041F" opacity={0.5} filter={`url(#${fid}blur)`} />
    <g filter={`url(#${fid}M)`}>
      <path d={`M${-r} 0 v44 a${r} ${r * 0.3} 0 0 0 ${2 * r} 0 v-44 Z`} fill={side} stroke={side} strokeWidth={10} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.3} fill={top} stroke={top} strokeWidth={10} />
    </g>
  </g>
);

/**
 * 2560x1440 channel banner. Name, tagline and language pills sit inside YouTube's central safe area (x 507-2053, y 508-931).
 * The cast stands on clay podiums on the sides: they show on TVs and desktops and may be cropped on phones.
 */
export const ChannelBanner: React.FC = () => {
  const fid = 'bn';
  return (
    <PaletteProvider palette={palettes.dusk}>
      <AbsoluteFill style={{background: '#0B0733', overflow: 'hidden'}}>
        <AuroraSvg w={2560} h={1440} id="bna" />
        <Stars n={170} w={2560} h={1440} />
        <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{position: 'absolute', inset: 0}}>
          <defs>
            <ClayDefs id={fid} />
            <linearGradient id="bnfloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#07041F" stopOpacity={0} />
              <stop offset="1" stopColor="#07041F" stopOpacity={0.7} />
            </linearGradient>
            <radialGradient id="bnq" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#8CF3E6" />
              <stop offset="0.55" stopColor="#2EC4B6" />
              <stop offset="1" stopColor="#12857B" />
            </radialGradient>
            <radialGradient id="bnmoon" cx="30%" cy="30%" r="85%">
              <stop offset="0" stopColor="#FFFBE6" />
              <stop offset="0.6" stopColor="#FFE9A8" />
              <stop offset="1" stopColor="#F2C14B" />
            </radialGradient>
            <radialGradient id="bnpink" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#FFB3D6" />
              <stop offset="0.55" stopColor="#FF5FA8" />
              <stop offset="1" stopColor="#C21E73" />
            </radialGradient>
            <radialGradient id="bngold" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#FFF6B8" />
              <stop offset="0.5" stopColor="#FFC62E" />
              <stop offset="1" stopColor="#F28C00" />
            </radialGradient>
            <radialGradient id="bnmoonglow">
              <stop offset="0" stopColor="#FFE9A8" stopOpacity={0.45} />
              <stop offset="1" stopColor="#FFE9A8" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect y={1050} width={2560} height={390} fill="url(#bnfloor)" />

          {/* floating clay objects in the sky (outside the phone-safe centre) */}
          <circle cx={2260} cy={250} r={260} fill="url(#bnmoonglow)" />
          <g filter={`url(#${fid}L)`}>
            <path transform="translate(2260 250) rotate(-20) scale(1.5)" d="M20 -88 A90 90 0 1 0 88 40 A72 72 0 1 1 20 -88 Z" fill="url(#bnmoon)" stroke="#FFE9A8" strokeWidth={12} strokeLinejoin="round" />
          </g>
          <g transform="translate(330 290) rotate(-10)">
            <g filter={`url(#${fid}L)`}>
              <path d="M-96 -70 H96 Q122 -70 122 -44 V44 Q122 70 96 70 H40 L-4 128 L-8 70 H-96 Q-122 70 -122 44 V-44 Q-122 -70 -96 -70 Z" fill="url(#bnq)" stroke="#2EC4B6" strokeWidth={14} strokeLinejoin="round" />
            </g>
            <text x="0" y="40" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="130" fill="#fff">?</text>
          </g>
          <g filter={`url(#${fid}M)`}>
            <path transform="translate(2050 380) scale(0.9)" d="M0 -70 Q16 -16 70 0 Q16 16 0 70 Q-16 16 -70 0 Q-16 -16 0 -70 Z" fill="url(#bngold)" stroke="#FFC62E" strokeWidth={16} strokeLinejoin="round" />
          </g>
          <g filter={`url(#${fid}M)`}>
            <circle cx={2300} cy={430} r={30} fill="url(#bnq)" />
            <circle cx={80} cy={440} r={26} fill="url(#bnpink)" />
            <circle cx={640} cy={250} r={20} fill="url(#bngold)" />
            <circle cx={1900} cy={300} r={22} fill="url(#bnpink)" />
          </g>

          {/* centre: clay mark */}
          <g transform="translate(495 420)">
            <foreignObject x="0" y="0" width="500" height="500">
              <ClayMark size={500} />
            </foreignObject>
          </g>

          {/* the cast on podiums */}
          <Podium x={185} y={1232} r={140} top="#FFD35A" side="#E8960C" fid={fid} />
          <Podium x={405} y={1232} r={130} top="#5FE3D4" side="#14998D" fid={fid} />
          <Podium x={2190} y={1232} r={140} top="#FF8FC2" side="#C93D86" fid={fid} />
          <Podium x={2410} y={1232} r={150} top="#A592FF" side="#5A3FD6" fid={fid} />
          <g style={{filter: 'drop-shadow(0 18px 16px rgba(6,3,30,0.4))'}}>
            <Character look={looks.boy} x={185} y={1226} scale={1.38} facing={1} frame={22} mood="smile" blinkOffset={0} shadow={false} />
            <Character look={looks.sticky} x={405} y={1226} scale={1.28} facing={1} wave={1} frame={10} mood="smile" blinkOffset={30} shadow={false} />
            <Character look={looks.girl} x={2190} y={1226} scale={1.34} facing={-1} frame={30} mood="smile" blinkOffset={40} shadow={false} />
            <Character look={looks.elder} x={2410} y={1226} scale={1.42} facing={-1} frame={14} mood="smile" blinkOffset={20} shadow={false} />
          </g>
        </svg>

        {/* centre text: 3D lettering, tagline, glass pills (inside the safe area) */}
        <div style={{position: 'absolute', left: 928, top: 566}}>
          <Title3D text="Doodle " size={120} top="#FFFFFF" bottom="#FFE9C0" side="#3A1FA6" />
          <Title3D text="Story Tales" size={120} top="#FFE27A" bottom="#FF9A1F" side="#3A1FA6" />
        </div>
        <div style={{position: 'absolute', left: 933, top: 738, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: CREAM, textShadow: '0 6px 20px rgba(6,3,30,0.5)'}}>
          Stories · Facts · Cartoons · Daily
        </div>
        <div style={{position: 'absolute', left: 928, top: 822}}>
          <GlassChips size={40} gap={22} />
        </div>
      </AbsoluteFill>
    </PaletteProvider>
  );
};
