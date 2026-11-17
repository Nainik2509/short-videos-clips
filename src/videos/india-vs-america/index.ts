// "3 Things India Does Better Than America": two streets, eleven people, the shot list.
import {defineReel} from "../../toon3d/reel";
import {LOOKS} from "./cast";
import {buildSets} from "./sets";
import {SHOTS} from "./shots";

/** people stand on the sidewalk, one kerb above the road */
const SIDEWALK = 0.14;

export const indiaVsAmerica = defineReel({sets: buildSets, looks: LOOKS, shots: SHOTS, groundY: SIDEWALK});
