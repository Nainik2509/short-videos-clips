import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SAFE, WIDTH} from './theme';

export type Word = {word: string; start: number; end: number};
export type TimingsFile = {audio: string; language: string; duration: number; words: Word[]};

/** Shows the words being spoken, a few at a time, always inside the safe zone. */
export const Captions: React.FC<{words: Word[]; wordsPerLine?: number}> = ({words, wordsPerLine = 4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const groups: Word[][] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) groups.push(words.slice(i, i + wordsPerLine));
  const group = groups.find((g, i) => {
    const end = g[g.length - 1].end + 0.2;
    const nextStart = groups[i + 1]?.[0].start ?? Infinity;
    return t >= g[0].start - 0.05 && t < Math.min(end, nextStart);
  });
  if (!group) return null;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: WIDTH - SAFE.left - SAFE.right,
          bottom: SAFE.bottom, // text sits on the safe-zone floor and grows upward
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.15,
          color: '#fff',
          WebkitTextStroke: '10px #1a1030',
          paintOrder: 'stroke fill',
          textShadow: '0 6px 18px rgba(0,0,0,0.45)',
        }}
      >
        {group.map((w, i) => (
          <span key={i} style={{color: t >= w.start && t < w.end ? '#ffd45e' : '#fff'}}>
            {w.word}{' '}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Storyboard helper: draws the safe zone so you can check nothing important sits outside it. */
export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: SAFE.top,
        right: SAFE.right,
        bottom: SAFE.bottom,
        border: '4px dashed rgba(255,60,90,0.9)',
        boxSizing: 'border-box',
      }}
    />
  </AbsoluteFill>
);
