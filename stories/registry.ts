import {entry, type StoryEntry} from '../src/story/entry';
// <stories:imports>
import sailingStones from './sailing-stones/story.json';
import sailingStonesTimings from './sailing-stones/timings.json';

/**
 * Every story that appears in Remotion. `npm run new-story` adds new ones between the markers.
 * (Edit by hand only to remove or reorder a story.)
 */
export const stories: StoryEntry[] = [
  // <stories:list>
  entry(sailingStones, sailingStonesTimings),
];
