// The player of every 3D reel: flat stick-figure cards in a painted 3D world.
// One three.js scene posed per frame from the reel's shot list; the post chain is
//   ink (own pass) -> lens blur (depth of field, per shot) -> bloom (emissive only) -> tone map -> colour grade.
// Cuts are hard (no cross-fades), like the study reels. Scene boundaries come from the voice timings.
import React, {useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";
import {AbsoluteFill, getInputProps, useCurrentFrame, useDelayRender} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import {useThree} from "@react-three/fiber";
import {EffectComposer} from "@react-three/postprocessing";
import {BlendFunction, BloomEffect, type EffectComposer as ComposerImpl, ToneMappingEffect, ToneMappingMode} from "postprocessing";
import {GRADES, GradeEffect, gradeFor} from "./grade";
import {InkPass} from "./ink";
import {LensBlur} from "./lensblur";
import {gradeOf} from "./stage";
import {FPS, WIDTH, HEIGHT} from "../lib/theme";
import type {Timeline} from "../story/timeline";
import {PinnedEffects} from "./PinnedEffects";
import {shotFor, type Reel} from "./reel";
import {World} from "./world";

/** Bloom for emissive sources only. Its mip chain always starts at 540x960, so the glow keeps its size at any output size. */
const makeBloom = () => {
  const bloom = new BloomEffect({blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6});
  const mip = bloom.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return bloom;
};

const forward = new THREE.Vector3();
const focusPoint = new THREE.Vector3();

/** A/B switches for test stills only (inputProps `{post: {ink: false}}`); everything is on by default. */
type PostToggles = {ink: boolean; lens: boolean; bloom: boolean; grade: boolean; composer: boolean; dpr?: number};
const postToggles = (): PostToggles => ({ink: true, lens: true, bloom: true, grade: true, composer: true, ...((getInputProps() as {post?: Partial<PostToggles>}).post ?? {})});

type Props = {reel: Reel; timeline: Timeline; /** draw the reel's cover shot instead of the frame's shot */ cover?: boolean};

/** frame -> which shot is showing, how far into it we are (seconds) and how far through its camera move (0..1) */
/** seconds into the cover shot at which the cover is taken (its pop-in effects have landed) */
const COVER_SECONDS = 2;

const resolve = ({reel, timeline, cover}: Props, frame: number) => {
  if (cover && reel.cover) return {shot: reel.cover, t: COVER_SECONDS, u: 1};
  const scenes = timeline.scenes;
  let i = 0;
  while (i + 1 < scenes.length && frame >= scenes[i + 1].from) i++;
  const scene = scenes[i];
  const seconds = (frame - scene.from) / FPS;
  const {shot, next} = shotFor(reel.shots, scene.spec.id, seconds);
  const start = scene.from + Math.round(shot.at * FPS);
  const end = next ? scene.from + Math.round(next.at * FPS) : scene.from + scene.frames;
  return {shot, t: (frame - start) / FPS, u: (frame - start) / Math.max(1, end - start)};
};

/**
 * The composer builds its passes a few React cycles after it mounts, and Remotion takes the picture as soon as the
 * first frame is "ready". So hold the render until the chain exists (its pass list stops changing), then draw once.
 */
const useComposerReady = (composerRef: React.RefObject<ComposerImpl | null>, enabled: boolean, advance: (timestamp: number) => void) => {
  const {delayRender, continueRender} = useDelayRender();
  const [hold] = useState(() => (enabled ? delayRender("toon3d: waiting for the post-processing chain") : null));
  useEffect(() => {
    if (hold === null) return;
    let alive = true;
    let steady = 0;
    let lastCount = -1;
    const poll = () => {
      if (!alive) return;
      const count = composerRef.current?.passes.length ?? 0;
      steady = count > 1 && count === lastCount ? steady + 1 : 0;
      lastCount = count;
      if (steady >= 3) {
        advance(performance.now());
        continueRender(hold);
        return;
      }
      requestAnimationFrame(poll);
    };
    poll();
    return () => {
      alive = false;
    };
  }, [hold, composerRef, advance, continueRender]);
};

const Inner: React.FC<Props> = (props) => {
  const {reel} = props;
  const frame = useCurrentFrame();
  const {camera, scene, advance} = useThree();
  const world = useMemo(() => new World(reel), [reel]);
  const on = useMemo(postToggles, []);
  const fx = useMemo(
    () => ({
      ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
      lens: new LensBlur({maxCoC: 24, nearScale: 1.2}),
      bloom: makeBloom(),
      tone: new ToneMappingEffect({mode: ToneMappingMode.NEUTRAL}),
      grade: new GradeEffect(GRADES.day, 1),
    }),
    [camera, scene],
  );
  const composerRef = useRef<ComposerImpl | null>(null);
  useComposerReady(composerRef, on.composer, advance);
  const composer = useMemo(
    () => (
      <EffectComposer ref={composerRef} multisampling={4}>
        {on.ink ? <primitive object={fx.ink} dispose={null} /> : null}
        {on.lens ? <primitive object={fx.lens.pre} dispose={null} /> : null}
        {on.lens ? <primitive object={fx.lens.main} dispose={null} /> : null}
        {on.bloom ? <primitive object={fx.bloom} dispose={null} /> : null}
        <primitive object={fx.tone} dispose={null} />
        {on.grade ? <primitive object={fx.grade} dispose={null} /> : null}
      </EffectComposer>
    ),
    [fx, on],
  );

  const {shot, t, u} = resolve(props, frame);
  const cam = camera as THREE.PerspectiveCamera;
  const {focus} = world.update(shot, t, Math.min(1, Math.max(0, u)), cam, scene);
  // thin-lens focus: distance along the view axis to the shot's focus point
  cam.getWorldDirection(forward);
  focusPoint.copy(focus);
  fx.lens.focus = Math.max(0.3, focusPoint.sub(cam.position).dot(forward));
  fx.lens.cInf = shot.cInf;
  gradeFor(fx.grade, gradeOf(shot.light));

  return (
    <>
      <primitive object={world.root} dispose={null} />
      {on.composer ? composer : null}
    </>
  );
};

/** the picture of a reel: scenes follow the voice, shots follow the scenes */
export const Reel3D: React.FC<Props> = (props) => {
  const dpr = postToggles().dpr;
  const frame = useCurrentFrame();
  const {shot, t} = resolve(props, frame);
  return (
    <AbsoluteFill style={{background: "#cfe3f2"}}>
      <ThreeCanvas
        width={WIDTH}
        height={HEIGHT}
        {...(dpr ? {dpr} : {})}
        shadows
        gl={{antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0}}
        camera={{fov: 40, near: 0.2, far: 1500}}
      >
        <Inner {...props} />
      </ThreeCanvas>
      <PinnedEffects effects={shot.effects?.(t) ?? []} t={t} />
    </AbsoluteFill>
  );
};
