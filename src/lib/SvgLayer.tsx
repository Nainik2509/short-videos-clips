import React from 'react';
import {HEIGHT, WIDTH} from './theme';

/** A full-frame SVG layer. Every scenery part draws into one, so layers stack in render order. */
export const SvgLayer: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{position: 'absolute', inset: 0}}>
    {children}
  </svg>
);
