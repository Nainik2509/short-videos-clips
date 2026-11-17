// "The Last Over": five places, seventeen people, the shot list. English and Hinglish stories share this one picture.
import {defineReel} from "../../toon3d/reel";
import {LOOKS} from "./cast";
import {buildSets} from "./sets";
import {COVER, SHOTS} from "./shots";

export const dhoniLastOver = defineReel({sets: buildSets, looks: LOOKS, shots: SHOTS, cover: COVER});
