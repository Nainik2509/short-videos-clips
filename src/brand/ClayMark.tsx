import React, {useId} from 'react';
import {Easing, interpolate} from 'remotion';

/**
 * Doodle Story Tales mark, soft-3D "clay" style: a puffy open book with a glossy golden spark floating above it,
 * a few clay orbs, and a contact shadow. Shapes are flat paths; the lighting (bevel, highlight, soft shadow) is
 * done by SVG lighting filters, so everything stays vector and deterministic.
 *
 *   progress 0..1  build-in (book inflates, spark pops, orbs drift in); 1 = finished
 *   seconds        idle motion (spark bob, orb float, twinkle)
 *   background     paint the aurora avatar tile behind the mark (profile picture)
 */
export const INK = '#0E0A33';
export const CREAM = '#FFF4DE';
export const MARIGOLD = '#FFC93C';
export const SAFFRON = '#FF8A1F';
export const TEAL = '#2EC4B6';
export const PINK = '#FF5FA8';
export const VIOLET = '#6C4BFF';

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Filters that turn a flat shape into a lit, puffy 3D one. Put once inside an <svg><defs>. */
export const ClayDefs: React.FC<{id: string}> = ({id}) => {
  const clay = (name: string, sd: number, ss: number, spec: number) => (
    <filter id={`${id}${name}`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={sd} result="b" />
      <feDiffuseLighting in="b" surfaceScale={ss} diffuseConstant={1.1} lightingColor="#fff" result="d">
        <feDistantLight azimuth={235} elevation={52} />
      </feDiffuseLighting>
      <feSpecularLighting in="b" surfaceScale={ss} specularConstant={spec} specularExponent={26} lightingColor="#fff" result="s">
        <feDistantLight azimuth={235} elevation={52} />
      </feSpecularLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1.35} k2={0} k3={0} k4={0} result="lit" />
      <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn" />
      <feComposite in="lit" in2="sIn" operator="arithmetic" k1={0} k2={1} k3={0.6} k4={0} result="out" />
      <feComposite in="out" in2="SourceAlpha" operator="in" />
    </filter>
  );
  return (
    <>
      {clay('L', 12, 9, 0.9)}
      {clay('M', 6, 5, 0.9)}
      {clay('S', 3, 3, 0.8)}
      <filter id={`${id}blur`} x="-30%" y="-80%" width="160%" height="260%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
      <filter id={`${id}grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </>
  );
};

/** Aurora mesh gradient: deep indigo with soft violet, magenta, teal and saffron glows. */
export const AuroraSvg: React.FC<{w: number; h: number; seconds?: number; id: string}> = ({w, h, seconds = 0, id}) => {
  const d = (s: number, a: number) => Math.sin(seconds * s) * a;
  const blob = (name: string, color: string, cx: number, cy: number, r: number, o: number) => (
    <>
      <radialGradient id={`${id}${name}`}>
        <stop offset="0" stopColor={color} stopOpacity={o} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}${name})`} />
    </>
  );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id={`${id}base`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#0B0733" />
          <stop offset="0.55" stopColor="#1B1263" />
          <stop offset="1" stopColor="#2A1480" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}base)`} />
      {blob('v', VIOLET, w * 0.3 + d(0.5, w * 0.03), h * 0.35 + d(0.4, h * 0.03), Math.max(w, h) * 0.5, 0.75)}
      {blob('m', PINK, w * 0.85 + d(0.45, w * 0.03), h * 0.2 + d(0.6, h * 0.03), Math.max(w, h) * 0.42, 0.55)}
      {blob('t', TEAL, w * 0.12 + d(0.35, w * 0.03), h * 0.9 + d(0.5, h * 0.02), Math.max(w, h) * 0.38, 0.45)}
      {blob('s', SAFFRON, w * 0.78 + d(0.4, w * 0.03), h * 1.0 + d(0.55, h * 0.02), Math.max(w, h) * 0.4, 0.5)}
      <rect width={w} height={h} filter={`url(#${id}grain)`} opacity={0.07} style={{mixBlendMode: 'overlay'}} />
    </svg>
  );
};

export const ClayMark: React.FC<{progress?: number; seconds?: number; background?: boolean; size?: number}> = ({
  progress = 1,
  seconds = 0,
  background = false,
  size = 800,
}) => {
  const id = useId().replace(/:/g, '');
  const book = Easing.out(Easing.back(1.4))(clamp01(progress / 0.4));
  const spark = Easing.out(Easing.back(2))(clamp01((progress - 0.3) / 0.4));
  const orbs = Easing.out(Easing.cubic)(clamp01((progress - 0.55) / 0.35));
  const idle = progress >= 1 ? 1 : 0;
  const bob = Math.sin(seconds * 2.6) * 9 * idle;
  const float = (p: number, a: number) => Math.sin(seconds * 1.8 + p) * a * idle;
  const tw = (p: number) => 0.7 + 0.3 * Math.sin(seconds * 4.5 + p);
  const glow = 0.8 + 0.12 * Math.sin(seconds * 2.2);

  return (
    <svg width={size} height={size} viewBox="0 0 800 800" style={{overflow: 'visible'}}>
      <defs>
        <ClayDefs id={id} />
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor="#FFD35A" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFD35A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}cover`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB454" />
          <stop offset="1" stopColor="#F2600C" />
        </linearGradient>
        <linearGradient id={`${id}page`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F4DDB4" />
        </linearGradient>
        <radialGradient id={`${id}star`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#FFF6B8" />
          <stop offset="0.5" stopColor="#FFC62E" />
          <stop offset="1" stopColor="#F28C00" />
        </radialGradient>
        {[
          ['teal', '#7FF0E2', '#2EC4B6', '#12857B'],
          ['pink', '#FFB3D6', '#FF5FA8', '#C21E73'],
          ['gold', '#FFF0A0', '#FFC93C', '#E08A00'],
        ].map(([n, a, b, c]) => (
          <radialGradient key={n} id={`${id}${n}`} cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor={a} />
            <stop offset="0.55" stopColor={b} />
            <stop offset="1" stopColor={c} />
          </radialGradient>
        ))}
        <radialGradient id={`${id}bgA`} cx="50%" cy="30%" r="85%">
          <stop offset="0" stopColor="#6C4BFF" />
          <stop offset="0.55" stopColor="#2B1A9A" />
          <stop offset="1" stopColor="#120A47" />
        </radialGradient>
        <radialGradient id={`${id}bgB`}>
          <stop offset="0" stopColor="#FF5FA8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#FF5FA8" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}bgC`}>
          <stop offset="0" stopColor="#2EC4B6" stopOpacity={0.5} />
          <stop offset="1" stopColor="#2EC4B6" stopOpacity={0} />
        </radialGradient>
      </defs>

      {background && (
        <>
          <rect width="800" height="800" fill={`url(#${id}bgA)`} />
          <circle cx="680" cy="700" r="420" fill={`url(#${id}bgB)`} />
          <circle cx="90" cy="640" r="380" fill={`url(#${id}bgC)`} />
          <rect width="800" height="800" filter={`url(#${id}grain)`} opacity={0.07} style={{mixBlendMode: 'overlay'}} />
        </>
      )}

      <circle cx="400" cy="270" r="250" fill={`url(#${id}glow)`} opacity={spark * glow * 0.55} />

      {/* contact shadow */}
      <ellipse cx="400" cy="716" rx="260" ry="30" fill="#07041F" opacity={0.55 * book} filter={`url(#${id}blur)`} />

      {/* the book: cover and two puffy pages */}
      <g transform={`translate(400 640) scale(${0.55 + 0.45 * book} ${0.3 + 0.7 * book}) translate(-400 -640)`}>
        <g filter={`url(#${id}L)`}>
          <path d="M140 572 C250 540 340 556 400 616 C460 556 550 540 660 572 L660 628 C550 600 460 616 400 680 C340 616 250 600 140 628 Z" fill={`url(#${id}cover)`} stroke="#F2780C" strokeWidth={24} strokeLinejoin="round" />
        </g>
        <g filter={`url(#${id}L)`}>
          <path d="M400 606 C340 552 250 536 166 562 L166 420 C250 394 340 410 400 462 Z" fill={`url(#${id}page)`} stroke="#FBEBCB" strokeWidth={24} strokeLinejoin="round" />
          <path d="M400 606 C460 552 550 536 634 562 L634 420 C550 394 460 410 400 462 Z" fill={`url(#${id}page)`} stroke="#FBEBCB" strokeWidth={24} strokeLinejoin="round" />
        </g>
        <path d="M400 468 L400 604" stroke="#B07A2E" strokeOpacity={0.35} strokeWidth={8} strokeLinecap="round" />
        <g fill="none" stroke="#2EC4B6" strokeWidth={13} strokeLinecap="round" filter={`url(#${id}S)`}>
          <path d="M216 466 C258 452 306 458 352 484" />
          <path d="M216 506 C258 492 302 498 352 522" />
          <path d="M448 484 C494 458 542 452 584 466" />
          <path d="M448 522 C498 498 542 492 584 506" />
        </g>
      </g>

      {/* the spark lifts out of the pages */}
      <g transform={`translate(0 ${bob})`}>
        <g transform={`translate(400 392) rotate(${(1 - spark) * -60}) scale(${spark}) translate(-400 -392)`}>
          <g filter={`url(#${id}M)`}>
            <path d="M400 118 Q420 236 536 262 Q420 288 400 400 Q380 288 264 262 Q380 236 400 118 Z" fill={`url(#${id}star)`} stroke="#FFC62E" strokeWidth={22} strokeLinejoin="round" />
          </g>
        </g>
      </g>

      {/* clay orbs and twinkles */}
      <g opacity={orbs}>
        <g filter={`url(#${id}S)`}>
          <circle cx="598" cy={206 + float(0, 8)} r="27" fill={`url(#${id}teal)`} />
          <circle cx="222" cy={190 + float(2, 8)} r="21" fill={`url(#${id}pink)`} />
          <circle cx="650" cy={352 + float(4, 6)} r="15" fill={`url(#${id}gold)`} />
          <circle cx="170" cy={330 + float(1, 6)} r="12" fill={`url(#${id}teal)`} />
        </g>
        <path d="M236 292 l8 -22 l8 22 l22 8 l-22 8 l-8 22 l-8 -22 l-22 -8 Z" fill="#fff" opacity={0.9 * tw(0)} />
        <path d="M566 96 l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6 Z" fill="#fff" opacity={0.85 * tw(2)} />
      </g>
    </svg>
  );
};
