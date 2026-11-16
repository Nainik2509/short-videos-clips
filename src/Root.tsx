import React from 'react';
import {Composition} from 'remotion';
import {stories} from '../stories/registry';
import {RigTest} from './compositions/RigTest';
import {EditReel, defaultEditSpec, type EditReelProps} from './edit/EditReel';
import {FPS, HEIGHT, WIDTH} from './lib/theme';
import {StoryReel, resolveTimeline, type StoryReelProps} from './story';

/**
 * Every composition is 1080x1920 at 30 fps.
 * EditReel is your own footage with hook, captions and music (npm run edit).
 * Stories come from stories/registry.ts (one composition per story, named by its slug);
 * their length follows the voice-over timings.
 */
export const Root: React.FC = () => (
  <>
    <Composition id="RigTest" component={RigTest} durationInFrames={90} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{guides: false}} />
    <Composition
      id="EditReel"
      component={EditReel}
      durationInFrames={Math.round(defaultEditSpec.durationSeconds * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{spec: defaultEditSpec, timings: null, guides: false} satisfies EditReelProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.spec.durationSeconds * FPS))})}
    />
    {stories.map(({story, timings}) => (
      <Composition
        key={story.slug}
        id={story.slug}
        component={StoryReel}
        durationInFrames={resolveTimeline(story, timings).totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{story, timings, guides: false, cover: false} satisfies StoryReelProps}
        calculateMetadata={({props}) => {
          const timeline = resolveTimeline(props.story, props.timings);
          return {
            durationInFrames: timeline.totalFrames,
            props: {...props, sceneFrames: timeline.sceneFrames, heroFrame: timeline.heroFrame},
          };
        }}
      />
    ))}
  </>
);
