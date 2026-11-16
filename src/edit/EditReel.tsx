import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, SafeZoneGuide, textStyle, type TimingsFile} from '../lib/Captions';
import type {Language} from '../lib/languages';
import {SAFE, WIDTH} from '../lib/theme';

/**
 * The settings of one edited reel. tools/edit.mjs saves them to work/<name>/edit.json,
 * so a change like "make the hook bigger" is one number (hookSize) and a re-render.
 */
export type EditSpec = {
  name: string;
  /** path inside public/, e.g. footage/my-clip.mp4 (the footage after dead air is cut) */
  src: string;
  durationSeconds: number;
  language: Language;
  hook: string;
  hookSize: number;
  hookSeconds: number;
  captions: boolean;
  /** caption font size in px; 0 = the language default */
  captionSize: number;
  /** path inside public/ of a music track, or "" for none */
  music: string;
  /** music level while nobody speaks (0–1); it ducks to a third while words are spoken */
  musicVolume: number;
};

export type EditReelProps = {spec: EditSpec; timings: TimingsFile | null; guides: boolean};

export const defaultEditSpec: EditSpec = {
  name: 'edit',
  src: '',
  durationSeconds: 5,
  language: 'english',
  hook: '',
  hookSize: 84,
  hookSeconds: 3,
  captions: true,
  captionSize: 0,
  music: '',
  musicVolume: 0.16,
};

const Hook: React.FC<{spec: EditSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = spec.hookSeconds * fps;
  const opacity = interpolate(frame, [0, 6, end - 8, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (!spec.hook || opacity <= 0) return null;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SAFE.left, width: WIDTH - SAFE.left - SAFE.right, top: SAFE.top + 20, ...textStyle(spec.language, spec.hookSize)}}>
        {spec.hook}
      </div>
    </AbsoluteFill>
  );
};

/** Your footage (dead air already cut) + hook + captions + music that ducks under your voice. */
export const EditReel: React.FC<EditReelProps> = ({spec, timings, guides}) => {
  const {fps} = useVideoConfig();
  const words = timings?.words ?? [];

  if (!spec.src) {
    return (
      <AbsoluteFill style={{background: '#14142a', color: '#fff', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', fontSize: 44, textAlign: 'center', padding: 80}}>
        Run: npm run edit -- raw-footage/your-clip.mp4
      </AbsoluteFill>
    );
  }

  const musicVolume = (frame: number) => {
    const t = frame / fps;
    const speaking = words.some((w) => t >= w.start - 0.1 && t <= w.end + 0.15);
    return spec.musicVolume * (speaking ? 0.33 : 1) * interpolate(frame, [spec.durationSeconds * fps - 30, spec.durationSeconds * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(spec.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {spec.music && <Audio src={staticFile(spec.music)} volume={musicVolume} loop />}
      <Hook spec={spec} />
      {spec.captions && timings && <Captions words={words} language={spec.language} size={spec.captionSize || undefined} />}
      {guides && <SafeZoneGuide />}
    </AbsoluteFill>
  );
};
