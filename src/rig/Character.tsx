import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {CharacterLook, Sleeves} from './looks';
import {StickFigure} from './StickFigure';

/**
 * Reusable SVG character, drawn in parts: head, body, arms, legs, cloth.
 *
 * Local units: feet at (0,0), the figure is ~470 units tall and faces +x.
 * Everything moves from the frame number, so it is fully deterministic for rendering.
 *
 *   walk 0..1   blend into a walk cycle        (stepRate = cycles per second)
 *   wave 0..1   blend the front arm into a wave
 *   blink and breathing are always on
 */
export type CharacterProps = {
  look: CharacterLook;
  /** position of the feet in screen pixels */
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  walk?: number;
  wave?: number;
  stepRate?: number;
  mood?: 'calm' | 'smile';
  /** shift the blink moment so two characters never blink together */
  blinkOffset?: number;
  shadow?: boolean;
  /** override the frame (otherwise the current Remotion frame is used) */
  frame?: number;
};

// ---- rig dimensions (local units) ----
const THIGH = 92;
const SHIN = 90;
const FOOT = 8;
const LEG_LEN = THIGH + SHIN + FOOT; // 190 → hip height when standing
const HIP_X = 24;
const LEG_W = 30;
const SHOULDER_Y = -305;
const SHOULDER_X = 52;
const ARM_W = 22;
const UPPER = 72;
const FORE = 70;
const HEAD_Y = -400;
const SW = 5; // ink outline width

/** Distance the body travels per second at stepRate 1 and scale 1 (use it to sync ground scroll). */
export const STRIDE_PER_CYCLE = 356;
export const walkSpeedPxPerSec = (stepRate: number, scale: number) => STRIDE_PER_CYCLE * stepRate * scale;

const rad = (d: number) => (d * Math.PI) / 180;
/** Positive angle swings a limb forward (+x). SVG rotate() is clockwise, hence the minus. */
const swing = (deg: number) => `rotate(${-deg})`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const defaultSleeves = (o: CharacterLook['outfit']): Sleeves =>
  o === 'kurta' ? 'long' : o === 'dhoti' ? 'none' : 'short';

export const Character: React.FC<CharacterProps> = (props) => {
  const {look, x, y, scale = 1, facing = 1, walk = 0, wave = 0, stepRate = 1.1, shadow = true} = props;
  const currentFrame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const frame = props.frame ?? currentFrame;
  const t = frame / fps;
  const ink = look.ink ?? '#160f2b';
  const mood = look.sacred ? 'calm' : props.mood ?? 'calm';
  const sleeves = look.sleeves ?? defaultSleeves(look.outfit);

  if (look.stick) {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
        {shadow && <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.18} />}
        <StickFigure look={look} t={t} frame={frame} walk={walk} wave={wave} stepRate={stepRate} mood={mood} blinkOffset={props.blinkOffset ?? 0} />
      </g>
    );
  }

  // ---- animation values ----
  const phase = t * stepRate * Math.PI * 2;
  const breathe = Math.sin(t * Math.PI * 2 * 0.28);

  const hipAmp = 28 * walk;
  const kneeAmp = 42 * walk;
  const hipR = hipAmp * Math.sin(phase);
  const hipL = hipAmp * Math.sin(phase + Math.PI);
  const kneeR = kneeAmp * Math.max(0, Math.cos(phase));
  const kneeL = kneeAmp * Math.max(0, Math.cos(phase + Math.PI));
  const reach = (hip: number, knee: number) => THIGH * Math.cos(rad(hip)) + SHIN * Math.cos(rad(hip - knee)) + FOOT;
  const bodyDrop = LEG_LEN - Math.max(reach(hipR, kneeR), reach(hipL, kneeL)); // keeps the lower foot on the ground

  const armAmp = 24 * walk;
  const sway = 10 * walk * Math.sin(phase);
  let armR = 7 - armAmp * Math.sin(phase);
  let armL = -7 + armAmp * Math.sin(phase);
  let elbowR = 8 + 14 * walk * Math.max(0, -Math.sin(phase));
  const elbowL = 8 + 14 * walk * Math.max(0, Math.sin(phase));
  const waveWob = Math.sin(t * Math.PI * 2 * 2.4);
  // wave: upper arm out to the side, forearm up and swinging (clear of the face)
  armR = lerp(armR, 100, wave);
  elbowR = lerp(elbowR, 62 + 24 * waveWob, wave);

  // blink: closes for ~5 frames every ~3.2 s
  const period = 96;
  const bf = (((frame + (props.blinkOffset ?? 0)) % period) + period) % period;
  const blink = bf < 5 ? 1 - Math.abs(bf - 2) / 2.5 : 0; // 0 open … 1 closed
  const baseOpen = mood === 'calm' ? 0.62 : 0.9;
  const eyeOpen = Math.max(0.06, baseOpen * (1 - blink));

  const headBob = -1.6 * breathe + 2 * walk * Math.cos(phase * 2);

  // ---- garment colour helpers ----
  const fullLegs = look.outfit === 'kurta' || look.outfit === 'tunic';
  const legColor = fullLegs ? look.bottom : look.skin;
  const upperSleeve = sleeves === 'none' ? look.skin : look.top;
  const foreSleeve = sleeves === 'long' ? look.top : look.skin;

  const Leg = ({side, hip, knee}: {side: 1 | -1; hip: number; knee: number}) => (
    <g transform={`translate(${side * HIP_X} ${-LEG_LEN}) ${swing(hip)}`}>
      <rect x={-LEG_W / 2} y={-6} width={LEG_W} height={THIGH + 6} rx={LEG_W / 2} fill={legColor} stroke={ink} strokeWidth={SW} />
      <g transform={`translate(0 ${THIGH}) rotate(${knee})`}>
        <rect x={-LEG_W / 2 + 2} y={-4} width={LEG_W - 4} height={SHIN + 4} rx={(LEG_W - 4) / 2} fill={legColor} stroke={ink} strokeWidth={SW} />
        <g transform={`translate(0 ${SHIN})`}>
          <ellipse cx={8} cy={0} rx={22} ry={FOOT + 1} fill={look.shoe} stroke={ink} strokeWidth={SW} />
        </g>
      </g>
    </g>
  );

  const Arm = ({side, shoulder, elbow}: {side: 1 | -1; shoulder: number; elbow: number}) => (
    <g transform={`translate(${side * SHOULDER_X} ${SHOULDER_Y}) ${swing(shoulder)}`}>
      <rect x={-ARM_W / 2} y={-8} width={ARM_W} height={UPPER + 8} rx={ARM_W / 2} fill={upperSleeve} stroke={ink} strokeWidth={SW} />
      <g transform={`translate(0 ${UPPER}) ${swing(elbow)}`}>
        <rect x={-ARM_W / 2 + 1} y={-4} width={ARM_W - 2} height={FORE + 4} rx={(ARM_W - 2) / 2} fill={foreSleeve} stroke={ink} strokeWidth={SW} />
        <circle cx={0} cy={FORE + 6} r={13} fill={look.skin} stroke={ink} strokeWidth={SW} />
      </g>
    </g>
  );

  const Garment = () => {
    switch (look.outfit) {
      case 'kurta':
        return (
          <g>
            <path
              d={`M -47 -322 Q 0 -336 47 -322 L 52 -190 L ${60 + sway} -98 Q 0 -86 ${-60 + sway} -98 L -52 -190 Z`}
              fill={look.top}
              stroke={ink}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <path d={`M ${-58 + sway} -104 Q 0 -92 ${58 + sway} -104`} fill="none" stroke={look.accent} strokeWidth={9} strokeLinecap="round" />
            <path d="M -18 -326 Q 0 -300 18 -326" fill="none" stroke={look.accent} strokeWidth={7} strokeLinecap="round" />
          </g>
        );
      case 'dress':
        return (
          <g>
            <path
              d={`M -47 -322 Q 0 -336 47 -322 L 45 -215 L ${82 + sway} -44 Q 0 -30 ${-82 + sway} -44 L -45 -215 Z`}
              fill={look.top}
              stroke={ink}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <rect x={-46} y={-228} width={92} height={16} rx={8} fill={look.accent} stroke={ink} strokeWidth={SW - 1} />
            <path d={`M ${-80 + sway} -52 Q 0 -38 ${80 + sway} -52`} fill="none" stroke={look.accent} strokeWidth={8} strokeLinecap="round" />
          </g>
        );
      case 'dhoti':
        return (
          <g>
            <path
              d={`M -48 -205 L 48 -205 L ${56 + sway} -40 Q 0 -28 ${-56 + sway} -40 Z`}
              fill={look.bottom}
              stroke={ink}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <path d={`M 0 -205 Q ${6 + sway / 2} -120 ${4 + sway} -34`} fill="none" stroke={ink} strokeWidth={3} opacity={0.5} />
            <path d="M -40 -312 L 44 -214" stroke={look.accent} strokeWidth={22} strokeLinecap="round" />
            <path d="M -40 -312 L 44 -214" stroke={ink} strokeWidth={2.5} strokeLinecap="round" opacity={0.35} />
            <rect x={-49} y={-214} width={98} height={14} rx={7} fill={look.accent} stroke={ink} strokeWidth={SW - 1} />
          </g>
        );
      case 'tunic':
      default:
        return (
          <g>
            <path
              d={`M -47 -322 Q 0 -336 47 -322 L 52 -190 L ${56 + sway / 2} -168 Q 0 -160 ${-56 + sway / 2} -168 L -52 -190 Z`}
              fill={look.top}
              stroke={ink}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <rect x={-50} y={-206} width={100} height={16} rx={8} fill={look.accent} stroke={ink} strokeWidth={SW - 1} />
          </g>
        );
    }
  };

  // chest: bare skin for the dhoti, otherwise the garment covers it
  const bareChest = look.outfit === 'dhoti';

  const HairBack = () => {
    if (look.hairStyle === 'long')
      return (
        <path d="M -64 -420 C -84 -340 -72 -296 -50 -288 L 50 -288 C 72 -296 84 -340 64 -420 Z" fill={look.hair} stroke={ink} strokeWidth={SW} strokeLinejoin="round" />
      );
    if (look.hairStyle === 'bun')
      return <circle cx={0} cy={-484} r={26} fill={look.hair} stroke={ink} strokeWidth={SW} />;
    return null;
  };

  const HairFront = () => {
    if (look.hairStyle === 'none') return null;
    return (
      <path
        d="M -59 -396 C -68 -474 68 -474 59 -396 C 46 -430 22 -442 0 -438 C -22 -442 -46 -430 -59 -396 Z"
        fill={look.hair}
        stroke={ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    );
  };

  const Headwear = () => {
    if (look.headwear === 'crown')
      return (
        <g>
          <path
            d="M -50 -440 L -56 -492 L -30 -468 L 0 -512 L 30 -468 L 56 -492 L 50 -440 Q 0 -428 -50 -440 Z"
            fill={look.accent}
            stroke={ink}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={-452} r={9} fill="#e8453c" stroke={ink} strokeWidth={3} />
        </g>
      );
    if (look.headwear === 'turban')
      return (
        <g>
          <path d="M -62 -418 C -70 -500 70 -500 62 -418 C 30 -446 -30 -446 -62 -418 Z" fill={look.accent} stroke={ink} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M -54 -440 C -20 -470 30 -470 56 -432" fill="none" stroke={ink} strokeWidth={3} opacity={0.5} />
          <path d="M -58 -428 C -20 -456 30 -456 60 -420" fill="none" stroke={ink} strokeWidth={3} opacity={0.5} />
        </g>
      );
    return null;
  };

  const Face = () => {
    const fx = 5; // features sit slightly toward the facing direction
    const eye = (cx: number) => (
      <g key={cx} transform={`translate(${cx + fx} -402)`}>
        <ellipse cx={0} cy={0} rx={11} ry={12 * eyeOpen} fill="#fff" stroke={ink} strokeWidth={2.5} />
        <ellipse cx={2} cy={1} rx={6} ry={8 * eyeOpen} fill="#1b1022" />
        <circle cx={4} cy={-2 * eyeOpen} r={2.2 * eyeOpen} fill="#fff" />
        <path d={`M -14 ${-3 - 12 * eyeOpen * 0.2} Q 0 ${-16 * (0.6 + eyeOpen * 0.4)} 14 ${-3 - 12 * eyeOpen * 0.2}`} fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
    const mouth =
      mood === 'smile'
        ? 'M -15 -368 Q 0 -352 15 -368'
        : 'M -11 -366 Q 0 -359 11 -366';
    return (
      <g>
        {eye(-21)}
        {eye(21)}
        <path d={`M ${-34 + fx} -424 Q ${-21 + fx} -431 ${-9 + fx} -425`} fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />
        <path d={`M ${9 + fx} -425 Q ${21 + fx} -431 ${34 + fx} -424`} fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />
        <path d={`M ${fx} -392 Q ${fx + 5} -382 ${fx} -379`} fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
        <path d={mouth} transform={`translate(${fx} 0)`} fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        <circle cx={-36 + fx} cy={-378} r={9} fill="#ff6b81" opacity={0.22} />
        <circle cx={36 + fx} cy={-378} r={9} fill="#ff6b81" opacity={0.22} />
        {look.bindi && <circle cx={fx} cy={-430} r={5} fill={look.bindi} />}
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      {shadow && <ellipse cx={0} cy={4} rx={86} ry={14} fill="#000" opacity={0.22} />}

      {/* everything above the ground moves with the body drop so feet stay planted */}
      <g transform={`translate(0 ${bodyDrop})`}>
        {/* back arm behind the body */}
        <Arm side={-1} shoulder={armL} elbow={elbowL} />

        {/* legs */}
        <Leg side={-1} hip={hipL} knee={kneeL} />
        <Leg side={1} hip={hipR} knee={kneeR} />

        {/* torso, breathing */}
        <g transform={`translate(0 -190) scale(1 ${1 + 0.014 * breathe}) translate(0 190)`}>
          <rect x={-45} y={-326} width={90} height={140} rx={34} fill={bareChest ? look.skin : look.top} stroke={ink} strokeWidth={SW} />
          <Garment />
        </g>

        {/* neck + head */}
        <g transform={`translate(0 ${headBob})`}>
          {look.halo && (
            <g opacity={0.9}>
              <circle cx={0} cy={HEAD_Y} r={96 + 3 * breathe} fill={look.halo} opacity={0.3} />
              <circle cx={0} cy={HEAD_Y} r={96 + 3 * breathe} fill="none" stroke={look.halo} strokeWidth={5} opacity={0.8} />
            </g>
          )}
          <HairBack />
          <rect x={-15} y={-352} width={30} height={34} rx={10} fill={look.skin} stroke={ink} strokeWidth={SW} />
          <ellipse cx={0} cy={HEAD_Y} rx={58} ry={62} fill={look.skin} stroke={ink} strokeWidth={SW} />
          {/* ears */}
          <ellipse cx={-58} cy={-398} rx={9} ry={14} fill={look.skin} stroke={ink} strokeWidth={SW - 1} />
          <ellipse cx={58} cy={-398} rx={9} ry={14} fill={look.skin} stroke={ink} strokeWidth={SW - 1} />
          <HairFront />
          <Face />
          <Headwear />
        </g>

        {/* front arm last so it can wave across the scene */}
        <Arm side={1} shoulder={armR} elbow={elbowR} />
      </g>
    </g>
  );
};
