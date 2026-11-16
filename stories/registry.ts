import {entry, type StoryEntry} from '../src/story/entry';
// <stories:imports>
import demoHindi from './demo-hindi/story.json';
import demoHindiTimings from './demo-hindi/timings.json';
import demoHinglish from './demo-hinglish/story.json';
import demoHinglishTimings from './demo-hinglish/timings.json';

/**
 * Every story that appears in Remotion. `npm run new-story` adds new ones between the markers.
 * (Edit by hand only to remove or reorder a story.)
 */
export const stories: StoryEntry[] = [
  // <stories:list>
  entry(demoHinglish, demoHinglishTimings),
  entry(demoHindi, demoHindiTimings),
];
