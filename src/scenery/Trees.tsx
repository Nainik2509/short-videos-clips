import React from 'react';
import {usePalette} from '../lib/palettes';

/** A single tree standing at (x, y) = base of the trunk. Used by HillLayer, usable on its own. */
export const Tree: React.FC<{x: number; y: number; scale?: number; kind?: 'round' | 'pine'}> = ({x, y, scale = 1, kind = 'round'}) => {
  const p = usePalette();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-10} y={-90} width={20} height={96} rx={6} fill={p.trunk} />
      {kind === 'round' ? (
        <g>
          <circle cx={0} cy={-150} r={68} fill={p.leaf[0]} />
          <circle cx={-34} cy={-120} r={44} fill={p.leaf[1]} />
          <circle cx={36} cy={-126} r={46} fill={p.leaf[0]} />
        </g>
      ) : (
        <g>
          <path d="M 0 -250 L 56 -120 L -56 -120 Z" fill={p.leaf[1]} />
          <path d="M 0 -200 L 74 -70 L -74 -70 Z" fill={p.leaf[0]} />
        </g>
      )}
    </g>
  );
};
