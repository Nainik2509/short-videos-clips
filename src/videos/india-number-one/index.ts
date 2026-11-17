// "5 Things India Is #1 In": seven places, thirteen people, the shot list.
import {defineReel} from "../../toon3d/reel";
import {LOOKS} from "./cast";
import {buildSets} from "./sets";
import {COVER, SHOTS} from "./shots";

export const indiaNumberOne = defineReel({sets: buildSets, looks: LOOKS, shots: SHOTS, cover: COVER});
