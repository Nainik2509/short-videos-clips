/**
 * A "look" is everything that makes one character different from another:
 * colours, clothing, hair and headwear. The rig itself never changes.
 * Copy a preset, change a few fields, and you have a new character.
 */
export type Outfit = 'kurta' | 'dress' | 'dhoti' | 'tunic';
export type HairStyle = 'short' | 'long' | 'bun' | 'none';
export type Headwear = 'none' | 'crown' | 'turban';
export type Sleeves = 'none' | 'short' | 'long';

export type CharacterLook = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  /** upper garment colour */
  top: string;
  /** lower garment colour (trousers, skirt, dhoti) */
  bottom: string;
  /** trims, sash, crown, turban */
  accent: string;
  shoe: string;
  outfit: Outfit;
  headwear: Headwear;
  /** overrides the outfit's default sleeve length */
  sleeves?: Sleeves;
  /** small dot on the forehead */
  bindi?: string;
  /** soft glow ring behind the head */
  halo?: string;
  /** Deities and sacred figures: forces a calm, respectful face (no other mood is allowed). */
  sacred?: boolean;
  ink?: string;
};

export const looks = {
  boy: {
    skin: '#d9a07a',
    hair: '#1d1424',
    hairStyle: 'short',
    top: '#f2a03d',
    bottom: '#f4ecd8',
    accent: '#c0392b',
    shoe: '#5a3a2a',
    outfit: 'kurta',
    headwear: 'none',
  },
  girl: {
    skin: '#c98d68',
    hair: '#1a1020',
    hairStyle: 'long',
    top: '#d6336c',
    bottom: '#d6336c',
    accent: '#ffd166',
    shoe: '#6b3a3a',
    outfit: 'dress',
    headwear: 'none',
    bindi: '#c0143c',
  },
  elder: {
    skin: '#b9835f',
    hair: '#e8e4ee',
    hairStyle: 'bun',
    top: '#fff4e0',
    bottom: '#fff4e0',
    accent: '#e0892b',
    shoe: '#4a3426',
    outfit: 'dhoti',
    headwear: 'none',
  },
  warrior: {
    skin: '#c98d68',
    hair: '#150f1c',
    hairStyle: 'short',
    top: '#2f6fbf',
    bottom: '#27436e',
    accent: '#ffd166',
    shoe: '#2a2a3a',
    outfit: 'tunic',
    headwear: 'turban',
  },
  deity: {
    skin: '#7fb2e5',
    hair: '#14102a',
    hairStyle: 'long',
    top: '#ffd166',
    bottom: '#f08a24',
    accent: '#ffdf7a',
    shoe: '#f2c14e',
    outfit: 'dhoti',
    headwear: 'crown',
    sleeves: 'none',
    bindi: '#e8453c',
    halo: '#ffe9a8',
    sacred: true,
  },
} satisfies Record<string, CharacterLook>;

export type LookName = keyof typeof looks;
