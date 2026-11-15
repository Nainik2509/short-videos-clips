import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgLayer} from '../lib/SvgLayer';
import {WIDTH, mod} from '../lib/theme';
import {usePalette} from '../lib/palettes';

/**
 * Soft clouds drifting right at different speeds (small, far clouds are slower).
 * `scroll` adds a little camera parallax on top of the drift.
 */
export const Clouds: React.FC<{count?: number; seed?: string; scroll?: number; yMin?: number; yMax?: number}> = ({
  count = 6,
  seed = 'clouds',
  scroll = 0,
  yMin = 260,
  yMax = 900,
}) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const span = WIDTH + 700;

  return (
    <SvgLayer>
      {Array.from({length: count}, (_, i) => {
        const size = 0.5 + random(`${seed}z${i}`) * 0.9;
        const speed = 8 + size * 22; // px per second, bigger = closer = faster
        const x = mod(random(`${seed}x${i}`) * span + speed * t - scroll * 0.05 * size, span) - 350;
        const y = yMin + random(`${seed}y${i}`) * (yMax - yMin);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${size})`} opacity={0.55 + size * 0.3}>
            <ellipse cx={0} cy={0} rx={110} ry={34} fill={p.cloud} />
            <ellipse cx={-44} cy={-22} rx={52} ry={40} fill={p.cloud} />
            <ellipse cx={30} cy={-34} rx={64} ry={48} fill={p.cloud} />
            <ellipse cx={78} cy={-8} rx={44} ry={30} fill={p.cloud} />
          </g>
        );
      })}
    </SvgLayer>
  );
};
