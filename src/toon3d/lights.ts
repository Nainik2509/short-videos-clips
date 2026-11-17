// Light presets: day, golden, and the warm / cool pair the Indian and American streets use. The sun is CAMERA-RELATIVE and frozen per shot (stage.ts sunDirection):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Values were tuned on renders.
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cardshade.ts)
  actorShadow: boolean;                                                              // character cards cast a shadow
  fog: string; fogNear: number; fogFar: number;
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
};
export type LightName = "day" | "golden" | "warm" | "cool";
export const LIGHTS: Record<LightName, LightPreset> = {
  day: {
    az: 75, el: 48,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    actorShadow: false,
    fog: "#b8d0ec", fogNear: 25, fogFar: 300,
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7,
    lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    actorShadow: true,
    fog: "#efb489", fogNear: 50, fogFar: 380,
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // warm midday for the Indian street: the day rig with a gold sun, warm shade and a creamy horizon
  warm: {
    az: 70, el: 46,
    lit: [1.62, 1.48, 1.22], shade: [0.34, 0.3, 0.34], lift: [0.06, 0.05, 0.09], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.93, 0.88], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.94, 0.9, 0.94],
    actorShadow: false,
    fog: "#f2dcc0", fogNear: 28, fogFar: 260,
    sunCol: "#ffe6b8", sunI: 2.8, sky: "#fff0d8", ground: "#c4a276", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  // cool overcast-blue midday for the American street: bluer shade, greyer horizon
  cool: {
    az: 80, el: 52,
    lit: [1.42, 1.48, 1.5], shade: [0.26, 0.3, 0.42], lift: [0.04, 0.07, 0.13], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [0.96, 0.97, 1.0], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.88, 0.9, 0.98],
    actorShadow: false,
    fog: "#cfdceb", fogNear: 30, fogFar: 320,
    sunCol: "#f4f6ff", sunI: 2.6, sky: "#dfeaff", ground: "#8f9aa6", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
};

/** world-only look per light (sky stops by elevation in degrees, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; stage.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<LightName, WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
  warm: {
    sky: { c: ["#f2dcc0", "#cfd2d8", "#8ebcec", "#5f9fe2", "#3f84d8"], e: [0, 3, 8, 16, 40] },
    cloud: { lit: "#fffaf0", mid: "#f0e6dc", shade: "#d6d2e6" },
    bounce: [0.02, 0.01, 0],
    sat: 1.12,
  },
  cool: {
    sky: { c: ["#cfdceb", "#a9c4e6", "#6fa0e0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    cloud: { lit: "#f6f9ff", mid: "#dfe5f3", shade: "#bcc7e6" },
    bounce: [0, 0, 0],
    sat: 1.04,
  },
};
