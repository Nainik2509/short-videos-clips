import React, {useId} from 'react';
import {Easing, interpolate} from 'remotion';

/**
 * The Doodle Story Tales mark: an open storybook with a golden spark lifting out of it.
 * Drawn with depth (a thick cover, a page stack, glossy highlights, a soft ground shadow)
 * so it reads as a little 3D toy while keeping bold cartoon outlines.
 *
 *   progress 0..1  build-in animation (book opens, spark rises, sparkles appear); 1 = finished
 *   seconds        drives the gentle idle motion (spark bob, glow, twinkle)
 *   background     draw the indigo avatar background (for the profile picture)
 */
export const INK = '#0E0A33';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const LogoMark: React.FC<{progress?: number; seconds?: number; background?: boolean; size?: number}> = ({
  progress = 1,
  seconds = 0,
  background = false,
  size = 800,
}) => {
  const id = useId().replace(/:/g, '');
  const book = Easing.out(Easing.cubic)(clamp01(progress / 0.35));
  const spark = Easing.out(Easing.back(1.8))(clamp01((progress - 0.3) / 0.4));
  const sparkles = clamp01((progress - 0.62) / 0.2);
  const bob = Math.sin(seconds * 3) * 7 * (progress >= 1 ? 1 : 0);
  const twinkle = (phase: number) => 0.75 + 0.25 * Math.sin(seconds * 5 + phase);
  const glow = 0.45 + 0.1 * Math.sin(seconds * 2.4);

  return (
    <svg width={size} height={size} viewBox="0 0 800 800" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}bg`} cx="50%" cy="36%" r="78%">
          <stop offset="0" stopColor="#3A2EA6" />
          <stop offset="0.6" stopColor="#221A7A" />
          <stop offset="1" stopColor="#120D40" />
        </radialGradient>
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor="#FFD35A" stopOpacity={glow + 0.25} />
          <stop offset="1" stopColor="#FFD35A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}cover`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB347" />
          <stop offset="1" stopColor="#F2680C" />
        </linearGradient>
        <linearGradient id={`${id}pageL`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFBF2" />
          <stop offset="0.7" stopColor="#FFF1D4" />
          <stop offset="1" stopColor="#E9CF9C" />
        </linearGradient>
        <linearGradient id={`${id}pageR`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#FFFBF2" />
          <stop offset="0.7" stopColor="#FFF1D4" />
          <stop offset="1" stopColor="#E9CF9C" />
        </linearGradient>
        <radialGradient id={`${id}star`} cx="45%" cy="38%" r="70%">
          <stop offset="0" stopColor="#FFF3A6" />
          <stop offset="0.55" stopColor="#FFCB2E" />
          <stop offset="1" stopColor="#F59A00" />
        </radialGradient>
        <filter id={`${id}blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {background && <rect width="800" height="800" fill={`url(#${id}bg)`} />}
      <circle cx="400" cy="300" r="230" fill={`url(#${id}glow)`} opacity={spark} />

      {/* ground shadow */}
      <ellipse cx="400" cy="676" rx="250" ry="30" fill="#000" opacity={0.38 * book} filter={`url(#${id}blur)`} />

      {/* the book opens from the spine */}
      <g transform={`translate(400 570) scale(${book} ${0.6 + 0.4 * book}) translate(-400 -570)`} strokeLinejoin="round" strokeWidth={12} stroke={INK}>
        {/* cover thickness */}
        <path d="M150 568 C250 542 340 554 400 606 C460 554 550 542 650 568 L650 616 C550 592 460 604 400 656 C340 604 250 592 150 616 Z" fill="#B5470B" />
        {/* cover */}
        <path d="M150 548 C250 522 340 534 400 586 C460 534 550 522 650 548 L650 596 C550 572 460 584 400 636 C340 584 250 572 150 596 Z" fill={`url(#${id}cover)`} />
        <path d="M176 560 C262 540 340 552 400 600" fill="none" stroke="#FFD9A0" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        {/* page stack edges */}
        <path d="M168 548 C250 522 340 536 400 584 C460 536 550 522 632 548" fill="none" stroke="#E9CF9C" strokeWidth={14} />
        {/* pages */}
        <path d="M400 570 C340 522 250 508 168 534 L168 392 C250 366 340 380 400 424 Z" fill={`url(#${id}pageL)`} />
        <path d="M400 570 C460 522 550 508 632 534 L632 392 C550 366 460 380 400 424 Z" fill={`url(#${id}pageR)`} />
        <g fill="none" stroke="#2EC4B6" strokeWidth={10} strokeLinecap="round">
          <path d="M212 432 C250 418 300 422 346 446" />
          <path d="M212 472 C250 458 296 462 346 486" />
          <path d="M454 446 C500 422 550 418 588 432" />
          <path d="M454 486 C504 462 550 458 588 472" />
        </g>
        {/* page gloss */}
        <path d="M190 400 C240 386 300 392 340 410" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      </g>

      {/* the spark lifts out of the pages */}
      <g transform={`translate(0 ${bob})`}>
        <g transform={`translate(400 392) rotate(${(1 - spark) * -50}) scale(${spark}) translate(-400 -392)`}>
          <path d="M400 112 Q414 224 524 248 Q414 272 400 392 Q386 272 276 248 Q386 224 400 112 Z" fill={`url(#${id}star)`} stroke={INK} strokeWidth={12} strokeLinejoin="round" />
          <path d="M400 150 Q408 214 466 240 Q420 232 404 190 Z" fill="#fff" opacity={0.75} />
          <path d="M400 392 C370 350 430 330 400 296" fill="none" stroke="#2EC4B6" strokeWidth={10} strokeLinecap="round" />
        </g>
      </g>

      {/* sparkles */}
      <g opacity={sparkles}>
        <circle cx="262" cy="170" r={11 * twinkle(0)} fill="#FF8A1F" />
        <circle cx="552" cy="150" r={8 * twinkle(2)} fill="#2EC4B6" />
        <circle cx="574" cy="318" r={9 * twinkle(4)} fill="#FFC93C" />
        <path d="M226 312 l9 -24 l9 24 l24 9 l-24 9 l-9 24 l-9 -24 l-24 -9 Z" fill="#FFF4DE" transform={`translate(6 -6) scale(${0.8 * twinkle(1)})`} />
      </g>
    </svg>
  );
};

/** Linear helper used by the brand compositions. */
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
