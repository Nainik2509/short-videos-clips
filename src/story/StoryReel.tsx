import React from 'react';
import {AbsoluteFill, Freeze, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Captions, SafeZoneGuide, textStyle, type TimingsFile} from '../lib/Captions';
import {languages} from '../lib/languages';
import {PaletteProvider, palettes} from '../lib/palettes';
import {SvgLayer} from '../lib/SvgLayer';
import {FPS, SAFE, WIDTH} from '../lib/theme';
import {Character, looks, walkSpeedPxPerSec, type CharacterLook} from '../rig';
import {Clouds, DiyaTrail, HillLayer, Moon, Petals, Sky, Sparks, groundY} from '../scenery';
import {styles, type StyleSpec} from '../styles';
import {resolveTimeline} from './timeline';
import type {CastMember, SceneSpec, StorySpec} from './types';

export type StoryReelProps = {
  story: StorySpec;
  timings: TimingsFile | null;
  /** draw the safe-zone outline (storyboard stills) */
  guides: boolean;
  /** cover image: the hook as a big title over the hero frame */
  cover: boolean;
  /** filled in by calculateMetadata: a representative frame per scene, and the cover frame */
  sceneFrames?: number[];
  heroFrame?: number;
};

const FADE = 6; // frames a scene cross-fades in over the one before it
const STEP_RATE = 1.1;
const DEFAULT_SCALE = 1.15;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const walks = (c: CastMember) => c.action === 'walk' || c.action === 'walkWave';
const waves = (c: CastMember) => c.action === 'wave' || c.action === 'walkWave';

const SceneView: React.FC<{spec: SceneSpec; index: number; frames: number; lead: number; style: StyleSpec}> = ({spec, index, frames, lead, style}) => {
  const frame = useCurrentFrame(); // 0 = start of the cross-fade
  const sceneFrame = frame - lead; // 0 = the scene's first word
  const {backdrop} = spec;
  const cast = spec.cast ?? [];
  const progress = clamp01(sceneFrame / frames);

  // Ground scroll: a walking character sets the speed so their feet match the ground.
  const walker = cast.find(walks);
  const walkerVelocity = walker ? ((walker.toX ?? walker.x) - walker.x) / (frames / FPS) : 0;
  const autoSpeed = walker ? (walker.facing ?? 1) * walkSpeedPxPerSec(STEP_RATE, walker.scale ?? DEFAULT_SCALE) - walkerVelocity : 0;
  const speed = backdrop.scrollSpeed ?? autoSpeed;
  const scroll = (backdrop.offset ?? index * 700) + (speed * sceneFrame) / FPS;

  const fade = lead ? interpolate(frame, [0, lead], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  const zoom = interpolate(sceneFrame, [0, frames], [1, spec.push ?? 1.05], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const trees = backdrop.trees ?? [8, 7, 4];
  const palette = style.palette(palettes[backdrop.palette]);

  return (
    <PaletteProvider palette={palette}>
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 72%'}}>
          <Sky sun={backdrop.sun} seed={spec.id} />
          {backdrop.moon && <Moon {...backdrop.moon} />}
          {(backdrop.clouds ?? 5) > 0 && <Clouds count={backdrop.clouds ?? 5} scroll={scroll} seed={spec.id} />}
          <HillLayer layer={0} scroll={scroll} trees={trees[0]} seed={spec.id} />
          <HillLayer layer={1} scroll={scroll} trees={trees[1]} seed={spec.id} />
          <HillLayer layer={2} scroll={scroll} trees={trees[2]} seed={spec.id} />
          {backdrop.diyas && <DiyaTrail scroll={scroll} />}
          <SvgLayer style={{filter: style.charFilter}}>
            {cast.map((c, i) => {
              const x = c.x + ((c.toX ?? c.x) - c.x) * progress;
              const look: CharacterLook = style.look(typeof c.look === 'string' ? looks[c.look] : c.look);
              const waveIn = waves(c) ? clamp01((sceneFrame - 8) / 12) : 0;
              return (
                <Character
                  key={i}
                  look={look}
                  x={x}
                  y={groundY(x, scroll)}
                  scale={c.scale ?? DEFAULT_SCALE}
                  facing={c.facing ?? 1}
                  walk={walks(c) ? 1 : 0}
                  wave={waveIn}
                  stepRate={STEP_RATE}
                  mood={c.mood}
                  blinkOffset={c.blinkOffset ?? i * 37}
                />
              );
            })}
          </SvgLayer>
          {backdrop.sparks && cast[0] && <Sparks x={cast[0].x + 140} y={groundY(cast[0].x, scroll) - 30} seed={spec.id} />}
          {backdrop.petals && <Petals seed={spec.id} />}
        </AbsoluteFill>
      </AbsoluteFill>
    </PaletteProvider>
  );
};

/** Series name + part number, then the hook question: shown in the first seconds, inside the safe zone. */
const Opening: React.FC<{story: StorySpec; big?: boolean}> = ({story, big = false}) => {
  const frame = useCurrentFrame();
  const lang = languages[story.language];
  const opacity = big ? 1 : interpolate(frame, [0, 6, 78, 96], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (opacity <= 0) return null;
  const badge = story.series ? `${story.series}${story.part ? ` · ${lang.part} ${story.part}` : ''}` : story.part ? `${lang.part} ${story.part}` : '';
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SAFE.left, width: WIDTH - SAFE.left - SAFE.right, top: SAFE.top + 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        {badge && (
          <div style={{...textStyle(story.language, 40), WebkitTextStroke: 0, background: '#ffd45e', color: '#1a1030', padding: '8px 30px', borderRadius: 40, textShadow: 'none'}}>{badge}</div>
        )}
        <div style={textStyle(story.language, big ? 92 : 64)}>{story.hook}</div>
      </div>
    </AbsoluteFill>
  );
};

/** The whole reel: scenes cross-fade in step with the voice; captions and opening sit on top. */
export const StoryReel: React.FC<StoryReelProps> = ({story, timings, guides, cover}) => {
  const frame = useCurrentFrame();
  const style = styles[story.style];
  const timeline = React.useMemo(() => resolveTimeline(story, timings), [story, timings]);

  // stop-motion styles redraw every N frames
  const hold = style.drawingsPerSec ? FPS / style.drawingsPerSec : 1;
  const held = Math.min(frame, Math.round(Math.floor(frame / hold) * hold));

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Freeze frame={held}>
        <AbsoluteFill style={{filter: style.filter}}>
          {timeline.scenes.map((s, i) => {
            const lead = i === 0 ? 0 : FADE;
            return (
              <Sequence key={s.spec.id} from={s.from - lead} durationInFrames={s.frames + lead}>
                <SceneView spec={s.spec} index={i} frames={s.frames} lead={lead} style={style} />
              </Sequence>
            );
          })}
        </AbsoluteFill>
        {style.Overlay && <style.Overlay />}
      </Freeze>
      {cover ? <Opening story={story} big /> : <Opening story={story} />}
      {!cover && timings && <Captions words={timings.words} language={story.language} />}
      {guides && <SafeZoneGuide />}
    </AbsoluteFill>
  );
};
