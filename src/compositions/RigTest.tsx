import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PaletteProvider, palettes} from '../lib/palettes';
import {SvgLayer} from '../lib/SvgLayer';
import {SafeZoneGuide} from '../lib/Captions';
import {Character, looks, walkSpeedPxPerSec} from '../rig';
import {Clouds, DiyaTrail, HillLayer, Moon, Petals, Sky, Sparks, groundY} from '../scenery';

export type RigTestProps = {guides: boolean};

const SCALE = 1.15;
const STEP_RATE = 1.1;
const START_X = 300;
const END_X = 620;
const TOTAL = 90;

/**
 * 3-second test: the boy walks across the hills, then waves.
 * The camera scrolls the world so his feet match the ground speed.
 */
export const RigTest: React.FC<RigTestProps> = ({guides}) => {
  const frame = useCurrentFrame();
  const charX = interpolate(frame, [0, TOTAL - 1], [START_X, END_X]);
  const screenSpeed = (END_X - START_X) / (TOTAL - 1); // px per frame the character drifts across the screen
  const worldSpeed = walkSpeedPxPerSec(STEP_RATE, SCALE) / 30; // px per frame his legs actually cover
  const scroll = frame * (worldSpeed - screenSpeed);
  const wave = interpolate(frame, [58, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const feetY = groundY(charX, scroll);

  return (
    <PaletteProvider palette={palettes.dusk}>
      <AbsoluteFill style={{background: '#000'}}>
        <Sky />
        <Moon x={820} y={430} r={86} phase={0.35} />
        <Clouds count={6} scroll={scroll} />
        <HillLayer layer={0} scroll={scroll} trees={9} />
        <HillLayer layer={1} scroll={scroll} trees={8} />
        <HillLayer layer={2} scroll={scroll} trees={5} />
        <DiyaTrail scroll={scroll} />
        <SvgLayer>
          <Character look={looks.boy} x={charX} y={feetY} scale={SCALE} walk={1} wave={wave} stepRate={STEP_RATE} mood="smile" />
        </SvgLayer>
        <Sparks x={charX + 140} y={feetY - 30} color="#ffd27a" />
        <Petals />
        {guides && <SafeZoneGuide />}
      </AbsoluteFill>
    </PaletteProvider>
  );
};
