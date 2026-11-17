// The seven places of "5 Things India Is #1 In": a plaza (opening and ending), a dairy farm, a post-office street,
// Dal Lake, a spice market, a cinema street and a Mumbai skyline. Only one set shows at a time, so every set is
// built around its own origin: the camera stands at z < 0 and looks toward +z, the action is near z = 0 and the
// backdrop is at z > 0. A set with a second stage (a close-up area) keeps it at x = SIDE, a third at x = 2 * SIDE.
import * as THREE from "three";
import {asphaltTexture, block, bunting, cone, facadeTexture, floor, lampPost, letterBox, milkCan, mound, numberBoard, painted, pavingTexture, post, scooter, shopFront, signBoard, solid, stripesTexture, tree, unlit, type ShopSpec} from "../../toon3d/kit";
import {ctex, grass, water} from "../../toon3d/paint";
import {INK} from "../../toon3d/toon";

export type SetName = "plaza" | "farm" | "post" | "lake" | "spice" | "cinema" | "mumbai";

/** the tower: nine stacked tiers of three floors each (27 floors), each tier topped by a thin slab */
const TIER_H = 3.6;
const SLAB_H = 0.35;
const TOWER_HEIGHT = 9 * (TIER_H + SLAB_H);

/** distance between the stages of one set */
export const SIDE = 40;

/** fixed points the shot list aims at, in metres */
export const SPOTS = {
  /** hanging chapter number: its centre, straight above the action */
  board: {y: 6.4, z: 2},
  farm: {cans: {x: 1.9, z: 0.8}, stackGap: 1.35, stackZ: 2.5},
  post: {officeZ: 6, boxX: 1.7, boxZ: 1.2, gridZ: 3},
  lake: {boatZ: 4, deckY: 0.84, deckZ: 2.75, shikara: {x: -2.4, y: 0.42, z: 0.4}},
  spice: {tableZ: 2.6, keeperZ: 3.8, foodFrontZ: 1.5},
  cinema: {frontZ: 6, cameraX: SIDE + 1, towerX: 2 * SIDE, towerZ: 3, titleY: [2.5, 4.3, 6.1]},
  mumbai: {towerZ: 16, roofY: TOWER_HEIGHT, doorZ: 10.5, streetX: -14},
} as const;

const SAFFRON = "#ff8a1f";
const MARIGOLD = "#ffc93c";
const TEAL = "#2ec4b6";
const PAPER = "#fff4de";
const MIDNIGHT = "#17124a";
const RED = "#d7263d";
const FESTIVE = ["#e8344a", MARIGOLD, TEAL, SAFFRON, "#7a4fd6"];

const shop = (over: Partial<ShopSpec> & Pick<ShopSpec, "sign" | "wall">): ShopSpec => ({
  w: 7, h: 7.5, depth: 7, roof: "#c9b9a0", glass: "#bfe8ff", floors: 3, ...over,
});

/** a shop whose front (at z = frontZ) faces the camera side */
const shopFacingCamera = (parent: THREE.Object3D, spec: ShopSpec, x: number, frontZ: number) => {
  const building = shopFront(spec);
  building.position.set(x, 0, frontZ + spec.depth / 2);
  building.rotation.y = Math.PI;
  parent.add(building);
};

/** the hanging chapter number, readable from the camera side */
const chapter = (parent: THREE.Object3D, n: number, x = 0) => {
  numberBoard(parent, n, x, SPOTS.board.z, SPOTS.board.y, "#e8344a", MARIGOLD).rotation.y = Math.PI;
};

const warmPaving = () => painted(pavingTexture("#e6c493", "#b8956a"));

// ---------------- plaza: opening and ending ----------------
const buildPlaza = () => {
  const g = new THREE.Group();
  floor(g, -60, 60, -60, 60, warmPaving(), 0, 1.5);
  const fronts: [number, ShopSpec][] = [
    [-15, shop({sign: {text: "BOOKS", bg: "#1fa35a", fg: PAPER}, wall: "#f4a6c0", floors: 2, h: 6})],
    [-7.5, shop({sign: {text: "SWEETS", bg: SAFFRON, fg: PAPER}, wall: "#ffe08a", awning: [SAFFRON, MARIGOLD], goods: FESTIVE})],
    [0, shop({w: 8, h: 9, sign: {text: "GENERAL STORE", bg: MIDNIGHT, fg: MARIGOLD}, wall: TEAL, awning: [MIDNIGHT, PAPER], goods: FESTIVE, floors: 4})],
    [7.5, shop({sign: {text: "CHAI", bg: "#e8344a", fg: PAPER}, wall: "#ffd9a0", awning: ["#e8344a", PAPER], goods: FESTIVE})],
    [15, shop({sign: {text: "TOYS", bg: "#7a4fd6", fg: PAPER}, wall: "#d8c7f3", floors: 2, h: 6})],
  ];
  for (const [x, spec] of fronts) shopFacingCamera(g, spec, x, 9);
  // the "#1" podium: three steps and a big board
  block(g, 3.6, 0.3, 2, MARIGOLD, 2.2, 0, 3.4);
  block(g, 2.6, 0.3, 1.5, SAFFRON, 2.2, 0.3, 3.4);
  post(g, 0.1, 2.2, INK, 2.2, 0.6, 3.4, 8);
  signBoard(g, "#1", MARIGOLD, MIDNIGHT, 2.6, 2.6, 2.2, 3.9, 3.4);
  for (const z of [4.5, 7.5]) bunting(g, new THREE.Vector3(-11, 6.2, z), new THREE.Vector3(11, 6.2, z), [SAFFRON, PAPER, "#1fa35a"], 22);
  for (const x of [-10.5, 10.5]) tree(g, x, 6.5, 5);
  for (const x of [-6, 6]) lampPost(g, x, 7.6);
  scooter(g, -5.2, 7.2, TEAL, 0.1);
  return g;
};

// ---------------- dairy farm ----------------
/** a wall of milk cans: `count` cans in rows of `cols`, bottom row first */
const canStack = (parent: THREE.Object3D, count: number, cols: number, x: number, z: number) => {
  const step = 0.56;
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    milkCan(parent, x + (col - (cols - 1) / 2) * step, row * 0.75, z);
  }
};

const buildFarm = () => {
  const g = new THREE.Group();
  floor(g, -120, 160, -80, 140, painted(grass()), 0, 6);
  for (const [x, z, r, h] of [[-38, 90, 46, 15], [22, 104, 60, 20], [80, 92, 44, 14]] as const) mound(g, r, h, "#6fbf5e", x, -2, z);
  // barn (screen right) with a pyramid roof
  block(g, 7, 4.2, 6, "#c0392b", -6.5, 0, 11);
  cone(g, 5.6, 2.6, "#8a3f35", -6.5, 4.2, 11, 4, Math.PI / 4);
  block(g, 2.2, 2.8, 0.1, "#5a2a22", -6.5, 0, 7.96);
  signBoard(g, "DAIRY", PAPER, "#c0392b", 3.2, 0.8, -6.5, 3.5, 7.9);
  // fence
  for (let x = -18; x <= 18; x += 2) post(g, 0.09, 1.2, "#f4ead8", x, 0, 6.5, 8);
  for (const y of [0.5, 1]) block(g, 36, 0.1, 0.08, "#f4ead8", 0, y, 6.5);
  for (const [x, z, h] of [[9, 12, 5.5], [13, 9, 4.6], [-14, 10, 5], [5, 16, 5.2]] as const) tree(g, x, z, h, "#4fa84a");
  // the day's milk
  const c = SPOTS.farm.cans;
  for (const [dx, dz] of [[0, 0], [0.62, 0.1], [0.3, 0.6], [1.15, 0.5]] as const) milkCan(g, c.x + dx, 0, c.z + dz);
  chapter(g, 1);

  // second stage: India's milk next to the European Union's, three cans across (15 : 10, the real ratio is about 1.5)
  const {stackGap, stackZ} = SPOTS.farm;
  floor(g, SIDE - 8, SIDE + 8, -8, 8, warmPaving(), 0.02, 1.5);
  canStack(g, 15, 3, SIDE + stackGap, stackZ);
  canStack(g, 10, 3, SIDE - stackGap, stackZ);
  signBoard(g, "INDIA", SAFFRON, MIDNIGHT, 1.9, 0.6, SIDE + stackGap, 5 * 0.75 + 0.45, stackZ);
  signBoard(g, "EU", "#2f6bff", PAPER, 1.9, 0.6, SIDE - stackGap, 4 * 0.75 + 0.45, stackZ);
  for (const x of [SIDE - 9, SIDE + 9]) tree(g, x, 9, 5, "#4fa84a");
  return g;
};

// ---------------- post-office street ----------------
const buildPost = () => {
  const g = new THREE.Group();
  floor(g, -60, 120, -60, 80, warmPaving(), 0, 1.5);
  floor(g, -60, 60, -9, -3.4, painted(asphaltTexture("#6f6560", "#2a2220")), 0.01, 3);
  const z = SPOTS.post.officeZ;
  shopFacingCamera(g, shop({w: 8, h: 8.5, sign: {text: "POST OFFICE", bg: RED, fg: MARIGOLD}, wall: "#f7d9c4", awning: [RED, PAPER], goods: [PAPER, "#b08d57", RED, "#f1e0b8"]}), 0, z);
  shopFacingCamera(g, shop({sign: {text: "STAMPS", bg: MIDNIGHT, fg: PAPER}, wall: "#ffd9a0", floors: 2, h: 6}), 7.6, z);
  shopFacingCamera(g, shop({sign: {text: "PARCELS", bg: "#1fa35a", fg: PAPER}, wall: "#9bd7e8", floors: 2, h: 6.5}), -7.6, z);
  letterBox(g, SPOTS.post.boxX, SPOTS.post.boxZ);
  scooter(g, -3.6, 3.6, RED, 0.2);
  for (const x of [-5.4, 5.4]) lampPost(g, x, 4.8);
  bunting(g, new THREE.Vector3(-9, 6, 4), new THREE.Vector3(9, 6, 4), [RED, MARIGOLD, PAPER], 18);
  chapter(g, 2);

  // second stage: letter boxes to the horizon
  for (let row = 0; row < 9; row++) {
    for (let col = -3; col <= 3; col++) letterBox(g, SIDE + col * 1.7 + (row % 2) * 0.85, SPOTS.post.gridZ + row * 2.3);
  }
  return g;
};

// ---------------- Dal Lake ----------------
const buildLake = () => {
  const g = new THREE.Group();
  floor(g, -300, 300, -120, 300, painted(water()), 0, 9);
  // mountains with snow caps, far shore with trees
  for (const [x, z, r, h] of [[-70, 130, 60, 62], [0, 150, 75, 80], [72, 135, 58, 58], [-140, 150, 60, 50], [140, 160, 64, 54]] as const) {
    cone(g, r, h, "#6f86a8", x, 0, z, 7, x * 0.01);
    cone(g, r * 0.36, h * 0.36, "#f6f9ff", x, h * 0.645, z, 7, x * 0.01);
  }
  block(g, 400, 0.5, 26, "#7fb86a", 0, 0, 78);
  for (let x = -60; x <= 60; x += 9) tree(g, x + (x % 2), 70, 6.5, "#3f8f4a");
  // the floating post office: hull, deck, cabin, roof, sign
  const {boatZ, deckY} = SPOTS.lake;
  block(g, 7.6, 0.7, 3.6, "#8a5a3c", 0, 0, boatZ);
  block(g, 8, 0.14, 4, "#e6c9a0", 0, 0.7, boatZ);
  block(g, 5.2, 2.3, 2.3, "#f7e6c4", 0, deckY, boatZ + 0.65);
  block(g, 6, 0.26, 3, RED, 0, deckY + 2.3, boatZ + 0.55);
  block(g, 1, 1.6, 0.06, "#5a3b2a", -1.4, deckY, boatZ - 0.52);
  block(g, 1.3, 0.9, 0.06, "#bfe8ff", 0.9, deckY + 0.8, boatZ - 0.52);
  signBoard(g, "FLOATING POST OFFICE", RED, MARIGOLD, 5, 0.7, 0, deckY + 2.95, boatZ - 0.6);
  letterBox(g, 3.1, boatZ - 1.4, deckY);
  // a shikara (small boat) with a canopy
  const s = SPOTS.lake.shikara;
  block(g, 3.8, 0.42, 1.1, MARIGOLD, s.x, 0, s.z);
  for (const dx of [-1.5, 1.5]) for (const dz of [-0.42, 0.42]) post(g, 0.04, 1.9, INK, s.x + dx, 0.42, s.z + dz, 6);
  block(g, 3.5, 0.12, 1.3, "#e8344a", s.x, 2.3, s.z);
  for (const [x, z] of [[3.5, -1.5], [5.2, 1.2], [-5.4, 2.6], [1.2, -2.6]] as const) post(g, 0.5, 0.04, "#3f8f4a", x, 0.01, z, 12);
  return g;
};

// ---------------- spice market ----------------
const SPICES = ["#d7263d", "#f2b705", "#8a5a3c", "#e86f1f", "#6a9a2d", "#f4d58d"];

/** a brass bowl heaped with ground spice */
const spiceBowl = (parent: THREE.Object3D, color: string, x: number, y0: number, z: number, r = 0.36) => {
  post(parent, r, 0.2, "#c9962f", x, y0, z, 16);
  cone(parent, r * 0.9, r * 0.9, color, x, y0 + 0.2, z, 16);
};

const buildSpice = () => {
  const g = new THREE.Group();
  floor(g, -60, 120, -60, 80, warmPaving(), 0, 1.5);
  shopFacingCamera(g, shop({sign: {text: "SPICES", bg: "#d7263d", fg: MARIGOLD}, wall: "#ffd9a0", awning: [SAFFRON, PAPER], goods: SPICES}), -4, 8);
  shopFacingCamera(g, shop({sign: {text: "MASALA", bg: "#1fa35a", fg: PAPER}, wall: "#f4a6c0", awning: ["#1fa35a", PAPER], goods: SPICES, h: 8.5}), 4, 8);
  // the stall: a table of bowls under a striped canopy, sacks at both ends
  const z = SPOTS.spice.tableZ;
  block(g, 6.2, 0.9, 1.3, "#8a5a3c", 0, 0, z);
  block(g, 6.5, 0.08, 1.5, "#e6c9a0", 0, 0.9, z);
  SPICES.forEach((color, i) => spiceBowl(g, color, (i - 2.5) * 1, 0.98, z - 0.15));
  for (const dx of [-3.1, 3.1]) for (const dz of [-0.7, 0.9]) post(g, 0.06, 3.2, INK, dx, 0, z + dz, 8);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.1, 2.4), painted(stripesTexture("#e8344a", PAPER)));
  canopy.position.set(0, 3.25, z + 0.1);
  canopy.rotation.x = -0.12;
  canopy.castShadow = true;
  g.add(canopy);
  for (const [x, color] of [[-4, "#d7263d"], [4, "#f2b705"]] as const) {
    post(g, 0.5, 0.8, "#d9c39a", x, 0, z - 0.5, 14);
    cone(g, 0.46, 0.4, color, x, 0.8, z - 0.5, 14);
  }
  bunting(g, new THREE.Vector3(-9, 6.2, 5.5), new THREE.Vector3(9, 6.2, 5.5), FESTIVE, 18);
  chapter(g, 3);

  // second stage: a food stall
  shopFacingCamera(g, shop({w: 8, sign: {text: "TASTY FOOD", bg: SAFFRON, fg: MIDNIGHT}, wall: "#ffe08a", awning: [SAFFRON, MARIGOLD], goods: SPICES}), SIDE, SPOTS.spice.foodFrontZ);
  for (const dx of [-2.2, 2.2]) post(g, 0.32, 0.3, "#555b66", SIDE + dx, 1.15, SPOTS.spice.foodFrontZ - 0.45, 14);
  return g;
};

// ---------------- cinema street ----------------
const buildCinema = () => {
  const g = new THREE.Group();
  const C = SPOTS.cinema;
  floor(g, -60, 160, -60, 80, warmPaving(), 0, 1.5);
  // the cinema: a tall hall, a marquee and a red carpet
  const hall = painted(facadeTexture("cinema-hall", {wall: "#7a4fd6", glass: MARIGOLD, frame: PAPER, cols: 5, rows: 2, ground: 0.45}));
  const wall = solid("#7a4fd6");
  block(g, 13, 10, 8, [wall, wall, solid("#5a3aa8"), wall, wall, hall], 0, 0, C.frontZ + 4);
  block(g, 10, 1.5, 1.8, "#e8344a", 0, 3.1, C.frontZ - 0.9);
  signBoard(g, "CINEMA", "#e8344a", MARIGOLD, 9, 1.2, 0, 3.85, C.frontZ - 1.85);
  for (const x of [-1.2, 1.2]) block(g, 1.9, 2.8, 0.1, "#2b2b33", x, 0, C.frontZ - 0.05);
  signBoard(g, "NOW SHOWING", MIDNIGHT, PAPER, 2.6, 0.5, -4.3, 2.7, C.frontZ - 0.1);
  signBoard(g, "TICKETS", MIDNIGHT, PAPER, 2.6, 0.5, 4.3, 2.7, C.frontZ - 0.1);
  floor(g, -1.6, 1.6, -6, C.frontZ, solid("#c0263a"), 0.02, 1);
  for (const x of [-1.9, 1.9]) for (const z of [-1, 1.5, 4]) {
    post(g, 0.07, 1, "#c9962f", x, 0, z, 8);
    post(g, 0.12, 0.08, "#c9962f", x, 1, z, 8);
  }
  for (const x of [-8.5, 8.5]) lampPost(g, x, 4.5);
  chapter(g, 4);

  // second stage: a film set (camera on a tripod, a light, a painted backdrop)
  block(g, 7, 4, 0.2, "#9bd7e8", SIDE, 0, 4);
  block(g, 7.3, 0.3, 0.3, "#8a5a3c", SIDE, 4, 4);
  mound(g, 1.6, 1.1, "#6fbf5e", SIDE - 1.8, 0, 3.7);
  const cam = new THREE.Group();
  for (const [dx, dz] of [[-0.35, -0.3], [0.35, -0.3], [0, 0.4]] as const) post(cam, 0.04, 1.35, INK, dx, 0, dz, 6);
  block(cam, 0.5, 0.45, 0.9, "#2b2b33", 0, 1.35, 0);
  post(cam, 0.2, 0.1, "#555b66", -0.05, 1.8, -0.2, 14).rotation.z = Math.PI / 2;
  post(cam, 0.2, 0.1, "#555b66", -0.05, 1.8, 0.25, 14).rotation.z = Math.PI / 2;
  post(cam, 0.14, 0.3, "#555b66", 0, 1.43, 0.6, 12).rotation.x = Math.PI / 2;
  cam.position.set(C.cameraX, 0, 0.6);
  cam.rotation.y = -0.5;
  g.add(cam);
  post(g, 0.05, 2.6, INK, SIDE - 3, 0, 1.6, 6);
  block(g, 0.7, 0.5, 0.35, MARIGOLD, SIDE - 3, 2.6, 1.6);

  // third stage: a marquee tower with three titles (plain text only), read bottom to top
  post(g, 0.22, 8.2, INK, C.towerX, 0, C.towerZ + 0.3, 10);
  signBoard(g, "NOW SHOWING", MIDNIGHT, MARIGOLD, 3.4, 0.7, C.towerX, 7.5, C.towerZ);
  const titles: [string, string, string][] = [["DANGAL", SAFFRON, MIDNIGHT], ["RRR", TEAL, MIDNIGHT], ["JAWAN", "#e8344a", PAPER]];
  titles.forEach(([title, bg, fg], i) => signBoard(g, title, bg, fg, 4.2, 1.5, C.towerX, C.titleY[i], C.towerZ));
  shopFacingCamera(g, shop({w: 9, h: 9, sign: {text: "CINEMA", bg: "#e8344a", fg: MARIGOLD}, wall: "#7a4fd6", floors: 3}), C.towerX, 9);
  return g;
};

// ---------------- Mumbai skyline ----------------
const helipadTexture = () =>
  ctex("helipad", 256, 256, (g) => {
    g.fillStyle = "#e9edf2";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = MARIGOLD;
    g.lineWidth = 16;
    g.beginPath();
    g.arc(128, 128, 104, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = RED;
    g.textAlign = "center";
    g.font = '800 150px "Helvetica Neue", Inter, Arial, sans-serif';
    g.fillText("H", 128, 182);
  });

/** [width, sideways shift] per tier, bottom first: a stack of offset boxes, three window rows each (9 x 3 = 27 floors) */
const TIER_SHAPE: [number, number][] = [[11, 0], [8.4, -0.5], [9.6, 0.6], [8, -0.3], [9.8, 0.7], [8.4, -0.6], [9.4, 0.4], [8, -0.2], [9.2, 0.3]];

const buildMumbai = () => {
  const g = new THREE.Group();
  const M = SPOTS.mumbai;
  floor(g, -200, 200, -80, 60, painted(asphaltTexture("#7a6f78", "#2a2230")), 0, 3);
  floor(g, -300, 300, 60, 400, painted(water()), -0.2, 9);
  floor(g, -200, 200, 2, 7, warmPaving(), 0.1, 1.5);
  // skyline behind the tower
  const skyline: [number, number, number, number, string][] = [
    [-34, 40, 12, 26, "#f4a6c0"], [-22, 34, 10, 18, "#9bd7e8"], [-13, 44, 9, 30, "#ffd9a0"], [13, 42, 9, 24, "#d8c7f3"],
    [23, 36, 11, 20, "#ffe08a"], [35, 44, 12, 32, "#9bd7e8"], [-46, 48, 12, 20, "#ffd9a0"], [48, 50, 12, 22, "#f4a6c0"],
  ];
  for (const [x, z, w, h, wall] of skyline) {
    const front = painted(facadeTexture(`sky|${wall}|${h}`, {wall, glass: "#fff2c0", frame: PAPER, cols: 4, rows: Math.round(h / 3), ground: 0}));
    const side = solid(wall);
    block(g, w, h, w, [side, side, solid("#c9b9a0"), side, side, front], x, 0, z);
  }
  // the tower
  const glassTier = painted(facadeTexture("tower-tier", {wall: "#e9edf2", glass: "#7fc4ee", frame: "#3d4350", cols: 6, rows: 3, ground: 0}));
  const concrete = solid("#e9edf2");
  TIER_SHAPE.forEach(([w, dx], i) => {
    const y = i * (TIER_H + SLAB_H);
    block(g, w, TIER_H, 9, [concrete, concrete, concrete, concrete, concrete, glassTier], dx, y, M.towerZ);
    block(g, w + 0.5, SLAB_H, 9.5, i % 3 === 1 ? "#4fa84a" : "#b9bfc9", dx, y + TIER_H, M.towerZ);
  });
  block(g, 3, 3.2, 0.1, "#2b2b33", 0, 0, M.doorZ + 0.9);
  // roof: three helipads and one parked helicopter
  const padTop = unlit(helipadTexture());
  const padSide = solid("#b9bfc9");
  const pads: [number, number][] = [[-2.6, -2], [2.6, -2], [0.2, 2.4]];
  for (const [dx, dz] of pads) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.25, 24), [padSide, padTop, padSide]);
    pad.position.set(dx, M.roofY + 0.12, M.towerZ + dz);
    g.add(pad);
  }
  const heli = new THREE.Group();
  mound(heli, 0.8, 0.62, "#e8344a", 0, 0.75, 0).scale.x = 1.5;
  block(heli, 1.9, 0.16, 0.16, "#e8344a", 1.7, 0.85, 0);
  block(heli, 0.12, 0.6, 0.12, "#e8344a", 2.6, 0.85, 0);
  post(heli, 0.05, 0.35, INK, 0, 1.3, 0, 6);
  block(heli, 3.4, 0.05, 0.18, INK, 0, 1.65, 0);
  block(heli, 0.18, 0.05, 3.4, INK, 0, 1.65, 0);
  for (const dz of [-0.5, 0.5]) block(heli, 1.8, 0.06, 0.06, INK, 0, 0, dz);
  heli.position.set(pads[2][0], M.roofY + 0.25, M.towerZ + pads[2][1]);
  heli.rotation.y = 0.5;
  g.add(heli);
  for (const x of [-14, -8, 8, 14]) tree(g, x, 8, 5, "#3f8f4a");
  for (const x of [-11, 11]) lampPost(g, x, 4.5, 6, "#2b3140");
  chapter(g, 5, SPOTS.mumbai.streetX); // off to one side, so the tower shots never see it
  return g;
};

/** every set, built once */
export const buildSets = (): Record<SetName, THREE.Group> => ({
  plaza: buildPlaza(),
  farm: buildFarm(),
  post: buildPost(),
  lake: buildLake(),
  spice: buildSpice(),
  cinema: buildCinema(),
  mumbai: buildMumbai(),
});
