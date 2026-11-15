import React from 'react';
import {random} from 'remotion';
import {SvgLayer} from '../lib/SvgLayer';
import {HEIGHT, WIDTH} from '../lib/theme';
import {usePalette} from '../lib/palettes';
import {HILL_LAYERS, TILE, hillY, layerScreenX} from './terrain';
import {Tree} from './Trees';

const STEP = 12;

/**
 * One hill layer. Layer 0 is the far hills, 1 the middle, 2 the front (ground).
 * Each layer scrolls at its own speed (parallax), which gives the depth.
 * Optionally scatters trees onto the ridge so they move with it.
 */
export const HillLayer: React.FC<{layer: 0 | 1 | 2; scroll: number; trees?: number; seed?: string}> = ({layer, scroll, trees = 0, seed = 'trees'}) => {
  const p = usePalette();
  const {parallax} = HILL_LAYERS[layer];
  const pts: string[] = [];
  for (let sx = -STEP; sx <= WIDTH + STEP; sx += STEP) pts.push(`${sx},${hillY(layer, sx + scroll * parallax).toFixed(1)}`);
  const d = `M ${pts.join(' L ')} L ${WIDTH + STEP},${HEIGHT} L ${-STEP},${HEIGHT} Z`;

  const items = Array.from({length: trees}, (_, i) => {
    const worldX = ((i + 0.15 + random(`${seed}${layer}j${i}`) * 0.7) * TILE) / trees;
    return {
      worldX,
      sx: layerScreenX(layer, worldX, scroll),
      s: (0.55 + layer * 0.3) * (0.85 + random(`${seed}${layer}s${i}`) * 0.4),
      kind: random(`${seed}${layer}k${i}`) > 0.5 ? ('round' as const) : ('pine' as const),
      i,
    };
  }).filter((t) => t.sx > -220 && t.sx < WIDTH + 220);

  return (
    <SvgLayer>
      <path d={d} fill={p.hills[layer]} />
      {items.map((t) => (
        <Tree key={t.i} x={t.sx} y={hillY(layer, t.worldX) + 6} scale={t.s} kind={t.kind} />
      ))}
    </SvgLayer>
  );
};
