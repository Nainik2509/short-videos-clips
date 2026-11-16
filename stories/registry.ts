import {entry, type StoryEntry} from '../src/story/entry';
// <stories:imports>
import whyCalledShampoo from './why-called-shampoo/story.json';
import whyCalledShampooTimings from './why-called-shampoo/timings.json';
import airplaneWindowHole from './airplane-window-hole/story.json';
import airplaneWindowHoleTimings from './airplane-window-hole/timings.json';
import dancingPlague1518 from './dancing-plague-1518/story.json';
import dancingPlague1518Timings from './dancing-plague-1518/timings.json';
import moonFollowsUs from './moon-follows-us/story.json';
import moonFollowsUsTimings from './moon-follows-us/timings.json';
import birbalKiKhichdi from './birbal-ki-khichdi/story.json';
import birbalKiKhichdiTimings from './birbal-ki-khichdi/timings.json';
import insaanBinaSoye from './insaan-bina-soye/story.json';
import insaanBinaSoyeTimings from './insaan-bina-soye/timings.json';
import dadiKaDiya from './dadi-ka-diya/story.json';
import dadiKaDiyaTimings from './dadi-ka-diya/timings.json';
import sailingStones from './sailing-stones/story.json';
import sailingStonesTimings from './sailing-stones/timings.json';

/**
 * Every story that appears in Remotion. `npm run new-story` adds new ones between the markers.
 * (Edit by hand only to remove or reorder a story.)
 */
export const stories: StoryEntry[] = [
  // <stories:list>
  entry(whyCalledShampoo, whyCalledShampooTimings),
  entry(airplaneWindowHole, airplaneWindowHoleTimings),
  entry(dancingPlague1518, dancingPlague1518Timings),
  entry(moonFollowsUs, moonFollowsUsTimings),
  entry(birbalKiKhichdi, birbalKiKhichdiTimings),
  entry(insaanBinaSoye, insaanBinaSoyeTimings),
  entry(dadiKaDiya, dadiKaDiyaTimings),
  entry(sailingStones, sailingStonesTimings),
];
