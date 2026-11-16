import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaletteProvider, palettes} from '../lib/palettes';
import {Character, looks} from '../rig';
import {Diya} from '../scenery';
import {INK, LogoMark, ramp} from './LogoMark';

const FONT = "'Arial Rounded MT Bold', 'Avenir Next Rounded', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const CREAM = '#FFF4DE';
const MARIGOLD = '#FFC93C';
const TEAL = '#2EC4B6';

/** 800x800 profile picture. YouTube crops it to a circle, so everything sits well inside. */
export const LogoStill: React.FC = () => (
  <AbsoluteFill style={{background: '#120D40'}}>
    <LogoMark background />
  </AbsoluteFill>
);

/** 4-second animated logo for the start or end of a Short: the book opens, the spark rises, the name pops in. */
export const LogoSting: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const tilt = 12 * Math.sin(frame / 18);
  const lift = interpolate(frame, [0, 24], [60, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const drawn = ramp(frame, 66, 90);
  const tagline = ramp(frame, 84, 104);

  const word = (text: string, color: string, from: number, y: number) => (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontSize: 170, fontWeight: 800, letterSpacing: -3, color, display: 'flex', justifyContent: 'center'}}>
      {[...text].map((ch, i) => {
        const p = Easing.out(Easing.back(2))(ramp(frame, from + i * 2.5, from + i * 2.5 + 14));
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: ramp(frame, from + i * 2.5, from + i * 2.5 + 6), transform: `translateY(${(1 - p) * 70}px) scale(${0.6 + 0.4 * p})`, textShadow: `0 10px 0 ${INK}, 0 18px 30px rgba(0,0,0,0.45)`}}>
            {ch}
          </span>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, #3A2EA6 0%, #1D1670 45%, #0E0A33 100%)', overflow: 'hidden'}}>
      {/* slow sunburst rays */}
      <AbsoluteFill style={{background: `repeating-conic-gradient(from ${frame * 0.6}deg at 50% 40%, rgba(255,201,60,0.10) 0deg 8deg, rgba(255,201,60,0) 8deg 24deg)`, maskImage: 'radial-gradient(circle at 50% 40%, #000 10%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 50% 40%, #000 10%, transparent 70%)'}} />
      {Array.from({length: 50}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * 1080, top: random(`sy${i}`) * 1500, width: 5 + random(`sr${i}`) * 7, height: 5 + random(`sr${i}`) * 7, borderRadius: 99, background: '#fff', opacity: (0.3 + 0.5 * random(`so${i}`)) * (0.6 + 0.4 * Math.sin(seconds * 3 + i))}} />
      ))}
      <div style={{position: 'absolute', left: 140, top: 250 + lift, width: 800, height: 800, perspective: 1600}}>
        <div style={{transform: `rotateY(${tilt}deg) rotateX(${-tilt / 4}deg)`, transformStyle: 'preserve-3d'}}>
          <LogoMark progress={ramp(frame, 0, 54)} seconds={seconds} />
        </div>
      </div>
      {word('Doodle', CREAM, 44, 1020)}
      {word('Story Tales', MARIGOLD, 58, 1190)}
      <svg width={1080} height={60} style={{position: 'absolute', left: 0, top: 1390}}>
        <path d="M210 30 C380 12 520 44 680 26 C760 18 810 30 870 22" fill="none" stroke={TEAL} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 700, color: CREAM, opacity: tagline, transform: `translateY(${(1 - tagline) * 16}px)`}}>
        Roz ek nayi kahani
      </div>
    </AbsoluteFill>
  );
};

const hillPath = (base: number, amp: number, cycles: number, phase: number, width = 2560, height = 1440) => {
  const pts: string[] = [];
  for (let x = 0; x <= width; x += 20) pts.push(`${x},${(base - amp * Math.sin((x / width) * Math.PI * 2 * cycles + phase)).toFixed(1)}`);
  return `M ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`;
};
const groundAt = (x: number) => 1300 - 30 * Math.sin((x / 2560) * Math.PI * 2 * 2 + 4);

/**
 * 2560x1440 channel banner. Name and tagline sit inside YouTube's central safe area (about 1546x423),
 * the cartoon cast stands on the sides, where they show on TVs and desktops and may be cropped on phones.
 */
export const ChannelBanner: React.FC = () => (
  <PaletteProvider palette={palettes.dusk}>
    <AbsoluteFill style={{background: '#120D40'}}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        <defs>
          <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#120D40" />
            <stop offset="0.55" stopColor="#2B2090" />
            <stop offset="1" stopColor="#8B3A9E" />
          </linearGradient>
          <radialGradient id="bglow" cx="50%" cy="78%" r="55%">
            <stop offset="0" stopColor="#FF8A1F" stopOpacity={0.45} />
            <stop offset="1" stopColor="#FF8A1F" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="bmoon" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF6D6" stopOpacity={0.5} />
            <stop offset="1" stopColor="#FFF6D6" stopOpacity={0} />
          </radialGradient>
          <filter id="bshadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>
        <rect width="2560" height="1440" fill="url(#bsky)" />
        <rect width="2560" height="1440" fill="url(#bglow)" />
        {Array.from({length: 150}, (_, i) => (
          <circle key={i} cx={random(`bx${i}`) * 2560} cy={random(`by${i}`) * 980} r={1.5 + random(`br${i}`) * 4} fill="#fff" opacity={0.25 + 0.6 * random(`bo${i}`)} />
        ))}
        <circle cx="2260" cy="250" r="250" fill="url(#bmoon)" />
        <mask id="bcrescent">
          <rect width="2560" height="1440" fill="#fff" />
          <circle cx="2296" cy="232" r="80" fill="#000" />
        </mask>
        <circle cx="2260" cy="250" r="86" fill="#FFF6D6" mask="url(#bcrescent)" />
        <path d={hillPath(1010, 90, 1.2, 0.5)} fill="#4A3AB0" opacity={0.85} />
        <path d={hillPath(1130, 80, 2, 1.6)} fill="#33279A" />
        <path d={hillPath(1290, 40, 2, 4)} fill="#1D1670" />

        {/* centre: the mark + name, inside the safe area */}
        <g transform="translate(500 480)">
          <foreignObject x="0" y="0" width="460" height="460">
            <LogoMark size={460} />
          </foreignObject>
        </g>
        <g fontFamily={FONT} fontWeight={800}>
          <text x="960" y="690" fontSize="150" fill={CREAM} stroke={INK} strokeWidth="14" paintOrder="stroke" strokeLinejoin="round">Doodle</text>
          <text x="960" y="840" fontSize="150" fill={MARIGOLD} stroke={INK} strokeWidth="14" paintOrder="stroke" strokeLinejoin="round">Story Tales</text>
        </g>
        <path d="M966 880 C1160 860 1320 900 1500 878 C1640 862 1720 884 1790 872" fill="none" stroke={TEAL} strokeWidth="12" strokeLinecap="round" />
        <text x="966" y="920" fontFamily={FONT} fontWeight={700} fontSize="44" fill={CREAM}>Roz ek nayi kahani</text>

        {/* the cast */}
        <g style={{filter: 'drop-shadow(0 16px 14px rgba(0,0,0,0.38))'}}>
          <Character look={looks.boy} x={250} y={groundAt(250) + 24} scale={1.5} facing={1} wave={1} frame={22} mood="smile" blinkOffset={0} />
          <Character look={looks.girl} x={2200} y={groundAt(2200) + 24} scale={1.38} facing={-1} frame={30} mood="smile" blinkOffset={40} />
          <Character look={looks.elder} x={2420} y={groundAt(2420) + 24} scale={1.5} facing={-1} frame={14} mood="smile" blinkOffset={20} />
        </g>
        <Diya x={2060} y={groundAt(2060) + 40} scale={1.5} seed={1} />
        <Diya x={470} y={groundAt(470) + 36} scale={1.5} seed={2} />
        <path d="M2040 360 l12 -32 l12 32 l32 12 l-32 12 l-12 32 l-12 -32 l-32 -12 Z" fill={MARIGOLD} />
        <path d="M330 300 l9 -24 l9 24 l24 9 l-24 9 l-9 24 l-9 -24 l-24 -9 Z" fill={CREAM} />
        <circle cx="2450" cy="520" r="10" fill={TEAL} />
        <circle cx="130" cy="560" r="9" fill="#FF8A1F" />
      </svg>
    </AbsoluteFill>
  </PaletteProvider>
);
