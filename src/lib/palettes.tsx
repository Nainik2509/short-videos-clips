import React, {createContext, useContext} from 'react';

export type Palette = {
  name: string;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  /** 0..1 — how visible the stars are */
  stars: number;
  /** back, middle, front hill colours */
  hills: [string, string, string];
  cloud: string;
  leaf: [string, string];
  trunk: string;
  ink: string;
  glow: string;
};

export const palettes = {
  dusk: {
    name: 'dusk',
    skyTop: '#2a1b5c',
    skyMid: '#a1428f',
    skyBottom: '#ffa45c',
    stars: 0.7,
    hills: ['#5b3a8c', '#3b2a6e', '#241a4d'],
    cloud: '#f7b6c8',
    leaf: ['#2f7a5a', '#44a070'],
    trunk: '#3a2433',
    ink: '#160f2b',
    glow: '#ffd27a',
  },
  night: {
    name: 'night',
    skyTop: '#070b2a',
    skyMid: '#14235e',
    skyBottom: '#2c3f8f',
    stars: 1,
    hills: ['#233a7a', '#182a5c', '#0d1a3d'],
    cloud: '#5b6fb8',
    leaf: ['#1d5a55', '#2a7a6c'],
    trunk: '#1a1630',
    ink: '#050816',
    glow: '#ffd27a',
  },
  dawn: {
    name: 'dawn',
    skyTop: '#5d6fd6',
    skyMid: '#f29bb5',
    skyBottom: '#ffe0a3',
    stars: 0.15,
    hills: ['#8f7fc9', '#6a6bb0', '#47508f'],
    cloud: '#fff1e6',
    leaf: ['#3f8f5f', '#68b678'],
    trunk: '#4a3340',
    ink: '#241a3b',
    glow: '#fff2b0',
  },
  day: {
    name: 'day',
    skyTop: '#3d8fe6',
    skyMid: '#79bff5',
    skyBottom: '#d7f0ff',
    stars: 0,
    hills: ['#9ad08a', '#6fbb6e', '#3f9a58'],
    cloud: '#ffffff',
    leaf: ['#2f8f4e', '#58b868'],
    trunk: '#6b4a32',
    ink: '#1d3326',
    glow: '#fff3b8',
  },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

const PaletteContext = createContext<Palette>(palettes.dusk);

export const PaletteProvider: React.FC<{palette: Palette; children: React.ReactNode}> = ({palette, children}) => (
  <PaletteContext.Provider value={palette}>{children}</PaletteContext.Provider>
);

export const usePalette = () => useContext(PaletteContext);
