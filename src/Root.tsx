import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, WIDTH} from './lib/theme';
import {RigTest} from './compositions/RigTest';

/**
 * Every composition is 1080x1920 at 30 fps.
 * Register each new story here (see CLAUDE.md → "Adding a story").
 */
export const Root: React.FC = () => (
  <>
    <Composition
      id="RigTest"
      component={RigTest}
      durationInFrames={90}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{guides: false}}
    />
  </>
);
