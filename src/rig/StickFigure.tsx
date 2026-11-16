import React from 'react';
import type {CharacterLook} from './looks';

/**
 * Stick-figure body for the Stick Tales series: round white head, thin line limbs, simple dot face.
 * Same local units as Character (feet at 0,0, about 470 tall, faces +x) so scale, ground and walking all match.
 * Colours come from the look: skin = head, ink = lines, top = vest, accent = beanie/hat, bottom = shorts band.
 */
export type StickFigureProps = {
  look: CharacterLook;
  t: number;
  frame: number;
  walk: number;
  wave: number;
  stepRate: number;
  mood: 'calm' | 'smile';
  blinkOffset: number;
};

const THIGH = 100;
const SHIN = 98;
const LEG_LEN = THIGH + SHIN; // hip height 198
const SHOULDER_Y = -318;
const HIP_Y = -200;
const HEAD_Y = -398;
const UPPER = 78;
const FORE = 76;
const LW = 14; // limb width
const rad = (d: number) => (d * Math.PI) / 180;
const swing = (deg: number) => `rotate(${-deg})`;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const StickFigure: React.FC<StickFigureProps> = ({look, t, frame, walk, wave, stepRate, mood, blinkOffset}) => {
  const ink = look.ink ?? '#111111';
  const phase = t * stepRate * Math.PI * 2;
  const breathe = Math.sin(t * Math.PI * 2 * 0.28);

  const hipAmp = 30 * walk;
  const kneeAmp = 40 * walk;
  const hipR = hipAmp * Math.sin(phase);
  const hipL = hipAmp * Math.sin(phase + Math.PI);
  const kneeR = kneeAmp * Math.max(0, Math.cos(phase));
  const kneeL = kneeAmp * Math.max(0, Math.cos(phase + Math.PI));
  const reach = (hip: number, knee: number) => THIGH * Math.cos(rad(hip)) + SHIN * Math.cos(rad(hip - knee));
  const bodyDrop = LEG_LEN - Math.max(reach(hipR, kneeR), reach(hipL, kneeL));

  const armAmp = 26 * walk;
  let armR = 6 - armAmp * Math.sin(phase);
  const armL = -6 + armAmp * Math.sin(phase);
  let elbowR = 10 + 14 * walk * Math.max(0, -Math.sin(phase));
  const elbowL = 10 + 14 * walk * Math.max(0, Math.sin(phase));
  const waveWob = Math.sin(t * Math.PI * 2 * 2.4);
  armR = lerp(armR, 105, wave);
  elbowR = lerp(elbowR, 60 + 24 * waveWob, wave);

  const period = 96;
  const bf = (((frame + blinkOffset) % period) + period) % period;
  const blink = bf < 5 ? 1 - Math.abs(bf - 2) / 2.5 : 0;
  const eyeH = Math.max(1.5, 11 * (1 - blink));
  const headBob = -1.4 * breathe + 2 * walk * Math.cos(phase * 2);

  const line = {stroke: ink, strokeWidth: LW, strokeLinecap: 'round' as const, fill: 'none'};

  const Leg = ({hip, knee}: {hip: number; knee: number}) => (
    <g transform={`translate(0 ${HIP_Y}) ${swing(hip)}`}>
      <path d={`M 0 0 V ${THIGH}`} {...line} />
      <g transform={`translate(0 ${THIGH}) rotate(${knee})`}>
        <path d={`M 0 0 V ${SHIN - 8}`} {...line} />
        <path d={`M 0 ${SHIN - 8} H 26`} {...line} />
      </g>
    </g>
  );

  const Arm = ({x, shoulder, elbow}: {x: number; shoulder: number; elbow: number}) => (
    <g transform={`translate(${x} ${SHOULDER_Y}) ${swing(shoulder)}`}>
      <path d={`M 0 0 V ${UPPER}`} {...line} />
      <g transform={`translate(0 ${UPPER}) ${swing(elbow)}`}>
        <path d={`M 0 0 V ${FORE}`} {...line} />
        <circle cx={0} cy={FORE + 4} r={11} fill="#fff" stroke={ink} strokeWidth={6} />
      </g>
    </g>
  );

  const fx = 8;
  return (
    <g transform={`translate(0 ${bodyDrop})`}>
      <Arm x={-4} shoulder={armL} elbow={elbowL} />
      <g transform={`translate(-16 0)`}>
        <Leg hip={hipL} knee={kneeL} />
      </g>
      <g transform={`translate(16 0)`}>
        <Leg hip={hipR} knee={kneeR} />
      </g>

      {/* body line and vest */}
      <g transform={`translate(0 ${HIP_Y}) scale(1 ${1 + 0.012 * breathe}) translate(0 ${-HIP_Y})`}>
        <path d={`M 0 ${SHOULDER_Y} V ${HIP_Y}`} {...line} />
        <path
          d={`M -30 ${SHOULDER_Y - 6} Q 0 ${SHOULDER_Y - 14} 30 ${SHOULDER_Y - 6} L 34 ${HIP_Y + 8} Q 0 ${HIP_Y + 18} -34 ${HIP_Y + 8} Z`}
          fill={look.top}
          stroke={ink}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path d={`M 0 ${SHOULDER_Y - 8} V ${HIP_Y + 14}`} stroke={ink} strokeWidth={4} opacity={0.55} />
        <rect x={-36} y={HIP_Y - 4} width={72} height={16} rx={8} fill={look.bottom} stroke={ink} strokeWidth={5} />
      </g>

      {/* head */}
      <g transform={`translate(0 ${headBob})`}>
        <circle cx={0} cy={HEAD_Y} r={74} fill={look.skin} stroke={ink} strokeWidth={9} />
        <g transform={`translate(${fx} 0)`}>
          <ellipse cx={-26} cy={HEAD_Y + 2} rx={9} ry={eyeH} fill={ink} />
          <ellipse cx={26} cy={HEAD_Y + 2} rx={9} ry={eyeH} fill={ink} />
          <circle cx={-23} cy={HEAD_Y - 2} r={2.6} fill="#fff" opacity={1 - blink} />
          <circle cx={29} cy={HEAD_Y - 2} r={2.6} fill="#fff" opacity={1 - blink} />
          <path
            d={mood === 'smile' ? `M -24 ${HEAD_Y + 34} Q 0 ${HEAD_Y + 60} 24 ${HEAD_Y + 34}` : `M -16 ${HEAD_Y + 42} Q 0 ${HEAD_Y + 50} 16 ${HEAD_Y + 42}`}
            fill="none"
            stroke={ink}
            strokeWidth={6}
            strokeLinecap="round"
          />
          {mood === 'smile' && <circle cx={-46} cy={HEAD_Y + 30} r={8} fill="#ff6b81" opacity={0.3} />}
          {mood === 'smile' && <circle cx={46} cy={HEAD_Y + 30} r={8} fill="#ff6b81" opacity={0.3} />}
        </g>
        {look.headwear === 'beanie' && (
          <g>
            <path d={`M -76 ${HEAD_Y - 22} C -80 ${HEAD_Y - 108} 80 ${HEAD_Y - 108} 76 ${HEAD_Y - 22} Z`} fill={look.accent} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
            <rect x={-80} y={HEAD_Y - 34} width={160} height={26} rx={13} fill={look.accent} stroke={ink} strokeWidth={8} />
            <path d={`M -52 ${HEAD_Y - 36} V ${HEAD_Y - 8} M -26 ${HEAD_Y - 36} V ${HEAD_Y - 8} M 0 ${HEAD_Y - 36} V ${HEAD_Y - 8} M 26 ${HEAD_Y - 36} V ${HEAD_Y - 8} M 52 ${HEAD_Y - 36} V ${HEAD_Y - 8}`} stroke={ink} strokeWidth={3} opacity={0.35} />
          </g>
        )}
      </g>

      <Arm x={4} shoulder={armR} elbow={elbowR} />
    </g>
  );
};
