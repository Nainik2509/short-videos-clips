// The two streets of "3 Things India Does Better Than America": a warm, busy Indian market street and a wide,
// cool American strip. Each is a group in its own corner of the world (x = 0 and x = 200) so one scene graph
// holds both and a shot just shows the one it needs. Street runs along z; the hero shops face the road.
import * as THREE from "three";
import {asphaltTexture, block, bunting, car, floor, lampPost, numberBoard, painted, pavingTexture, post, qrTexture, scooter, shopFront, signTexture, solid, stripesTexture, tree, unlit, type ShopSpec} from "../../toon3d/kit";
import {INK} from "../../toon3d/toon";

export const INDIA_X = 0;
export const USA_X = 200;

/** where the story happens, in each street's own coordinates (add INDIA_X / USA_X for the world) */
export const SPOTS = {
  india: {
    customerX: 4.6, // sidewalk, in front of a shop counter
    keeperX: 7.7, // shopkeeper standing behind a shop counter
    chaiKeeperX: 6.8, // chaiwallah behind the stall counter
    chai: -10, mobile: 0, pharmacy: 10, fashion: -21, sweets: 19,
  },
  usa: {
    sidewalkX: 9.5,
    customerX: 15.4, // in front of a shop counter
    keeperX: 17.7, // clerk behind a counter
    bank: -26, wireless: -8, clinic: 10, grocery: 28,
  },
} as const;

type Row = {z: number; spec: ShopSpec};

/** a row of shops along z whose fronts sit at x = frontX and face the road (dir -1: road is toward -x) */
const row = (parent: THREE.Object3D, shops: Row[], frontX: number, dir: 1 | -1) => {
  for (const {z, spec} of shops) {
    const building = shopFront(spec);
    // dir -1: the shop stands at x > frontX with its front turned to face -x; dir 1: it stands at x < frontX, facing +x
    building.position.set(frontX + (dir === -1 ? spec.depth / 2 : -spec.depth / 2), 0, z);
    building.rotation.y = dir === -1 ? -Math.PI / 2 : Math.PI / 2;
    parent.add(building);
  }
};

const shop = (over: Partial<ShopSpec> & Pick<ShopSpec, "sign" | "wall">): ShopSpec => ({
  w: 7, h: 7.5, depth: 7, roof: "#c9b9a0", glass: "#bfe8ff", floors: 3, ...over,
});

// ---------------- India ----------------
const indiaGoods = ["#e8344a", "#ffc93c", "#2ec4b6", "#7a4fd6", "#ff8a1f"];

const buildIndia = () => {
  const g = new THREE.Group();
  const roadTex = asphaltTexture("#6f6560", "#2a2220");
  const paveTex = pavingTexture("#e6c493", "#b8956a");
  floor(g, -4, 4, -70, 70, painted(roadTex), 0, 3);
  floor(g, 4, 8, -70, 70, painted(paveTex), 0.14, 1.5);
  floor(g, -8, -4, -70, 70, painted(paveTex), 0.14, 1.5);
  block(g, 0.2, 0.14, 140, "#b8956a", 4.05, 0, 0);
  block(g, 0.2, 0.14, 140, "#b8956a", -4.05, 0, 0);
  floor(g, 8, 60, -70, 70, solid("#d9b98a"), 0, 1);
  floor(g, -60, -8, -70, 70, solid("#d9b98a"), 0, 1);

  const right: Row[] = [
    {z: -42, spec: shop({sign: {text: "TAILOR", bg: "#2f6bff", fg: "#fff4de"}, wall: "#ffd9a0", awning: ["#2f6bff", "#fff4de"], goods: indiaGoods})},
    {z: -32, spec: shop({sign: {text: "BOOKS", bg: "#1fa35a", fg: "#fff4de"}, wall: "#f4a6c0", floors: 2, h: 6})},
    {z: -21, spec: shop({w: 8, h: 8.5, sign: {text: "SILK & CO", bg: "#e8344a", fg: "#fff4de"}, wall: "#f6b3c8", awning: ["#e8344a", "#fff4de"], goods: indiaGoods})},
    {z: -10, spec: shop({sign: {text: "GENERAL STORE", bg: "#17124a", fg: "#ffc93c"}, wall: "#2ec4b6", floors: 3})},
    {z: 0, spec: shop({sign: {text: "MOBILE", bg: "#2f6bff", fg: "#fff4de"}, wall: "#ffd9a0", awning: ["#2f6bff", "#fff4de"], goods: ["#23232b", "#2f6bff", "#ffffff", "#ff8a1f", "#3ddc84"], h: 8.5})},
    {z: 10, spec: shop({sign: {text: "PHARMACY", bg: "#1fa35a", fg: "#ffffff"}, wall: "#f7f1e3", awning: ["#1fa35a", "#ffffff"], goods: ["#ffffff", "#1fa35a", "#ff7ab6", "#ffd45e", "#5fe3d4"], h: 8.5})},
    {z: 19, spec: shop({w: 6, sign: {text: "SWEETS", bg: "#ff8a1f", fg: "#fff4de"}, wall: "#ffe08a", awning: ["#ff8a1f", "#ffc93c"], goods: ["#ff8a1f", "#ffc93c", "#ffffff", "#e8344a"], floors: 2, h: 6.5})},
    {z: 28, spec: shop({sign: {text: "CAFE", bg: "#7a4fd6", fg: "#fff4de"}, wall: "#d8c7f3"})},
    {z: 38, spec: shop({sign: {text: "FRUITS", bg: "#3ddc84", fg: "#17124a"}, wall: "#fff0b8", awning: ["#3ddc84", "#ffffff"], goods: indiaGoods})},
  ];
  const left: Row[] = [
    {z: -36, spec: shop({sign: {text: "HOTEL", bg: "#e8344a", fg: "#fff4de"}, wall: "#ffc93c", floors: 4, h: 10})},
    {z: -25, spec: shop({sign: {text: "STUDIO", bg: "#17124a", fg: "#fff4de"}, wall: "#9bd7e8", awning: ["#17124a", "#ffffff"], goods: indiaGoods})},
    {z: -14, spec: shop({sign: {text: "TOYS", bg: "#ff8a1f", fg: "#17124a"}, wall: "#f4a6c0", awning: ["#ff8a1f", "#ffffff"], goods: indiaGoods})},
    {z: -3, spec: shop({sign: {text: "JUICE", bg: "#ffc93c", fg: "#17124a"}, wall: "#e86f51", awning: ["#ffc93c", "#ffffff"], goods: indiaGoods})},
    {z: 8, spec: shop({sign: {text: "FLOWERS", bg: "#e8344a", fg: "#fff4de"}, wall: "#ffd9a0", awning: ["#e8344a", "#ffc93c"], goods: indiaGoods, floors: 2, h: 6})},
    {z: 19, spec: shop({sign: {text: "SHOES", bg: "#2f6bff", fg: "#fff4de"}, wall: "#2ec4b6", awning: ["#2f6bff", "#ffffff"], goods: indiaGoods})},
    {z: 30, spec: shop({sign: {text: "MEDIA", bg: "#7a4fd6", fg: "#fff4de"}, wall: "#ffe08a"})},
  ];
  row(g, right, 8, -1);
  row(g, left, -8, 1);

  // chai stall on the sidewalk in front of the general store: counter, striped awning, kettle, glasses, QR stand
  const chai = new THREE.Group();
  block(chai, 3.2, 1.05, 1.1, "#8a5a3c", 0, 0, 0);
  block(chai, 3.3, 0.1, 1.2, "#f2c98f", 0, 1.05, 0);
  block(chai, 3.3, 0.9, 0.12, "#ffc93c", 0, 0.1, -0.56);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 1.9), painted(stripesTexture("#ff8a1f", "#fff4de")));
  awning.position.set(0, 2.7, 0);
  awning.rotation.x = 0.18;
  awning.castShadow = true;
  chai.add(awning);
  post(chai, 0.06, 2.65, "#3d4350", -1.8, 0, -0.7, 8);
  post(chai, 0.06, 2.65, "#3d4350", 1.8, 0, -0.7, 8);
  post(chai, 0.06, 2.65, "#3d4350", -1.8, 0, 0.7, 8);
  post(chai, 0.06, 2.65, "#3d4350", 1.8, 0, 0.7, 8);
  post(chai, 0.28, 0.5, "#c8ccd2", -0.9, 1.15, 0, 14);
  block(chai, 0.5, 0.06, 0.12, "#c8ccd2", -0.55, 1.5, 0);
  for (let i = 0; i < 5; i++) post(chai, 0.07, 0.2, "#f2c98f", 0.2 + i * 0.25, 1.15, 0.1, 10);
  const qr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.52), unlit(qrTexture()));
  qr.position.set(1.15, 1.45, 0.62);
  qr.rotation.x = -0.15;
  chai.add(qr);
  block(chai, 0.04, 0.38, 0.04, INK, 1.15, 1.08, 0.58);
  const chaiSign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.6), unlit(signTexture("CHAI", "#ffc93c", "#17124a", 512, 180)));
  chaiSign.position.set(0, 2.15, 0.72);
  chai.add(chaiSign);
  chai.position.set(6.0, 0.14, SPOTS.india.chai);
  chai.rotation.y = -Math.PI / 2;
  g.add(chai);
  // the chaiwallah stands behind the counter (x 6.8), customers on the sidewalk in front of it (x 4.5)

  // pharmacy cross on a pole
  const cross = new THREE.Group();
  block(cross, 0.5, 1.5, 0.2, "#1fa35a", 0, 0, 0);
  block(cross, 1.5, 0.5, 0.2, "#1fa35a", 0, 0.5, 0);
  cross.position.set(7.4, 6.2, SPOTS.india.pharmacy);
  cross.rotation.y = -Math.PI / 2;
  g.add(cross);

  // street life
  // trees stay out of the hero stretch (z -24..22) so no shot looks through a trunk
  for (const z of [-36, 30, 40]) tree(g, 4.7, z, 4.6);
  for (const z of [-34, -20, -2, 12, 26]) tree(g, -4.7, z, 4.6);
  for (const [x, z, c, yaw] of [[3.2, -17, "#e8344a", 0.05], [3.4, -3.5, "#2f6bff", -0.04], [3.1, 6, "#ffc93c", 0.03], [-3.3, -8, "#3ddc84", 0.02], [-3.2, 13, "#ff8a1f", -0.03]] as const) scooter(g, x, z, c, Math.PI / 2 + yaw);
  for (const z of [-30, -15.5, 5, 24]) lampPost(g, 4.3, z);
  for (const z of [-16, -5, 5, 14]) bunting(g, new THREE.Vector3(7.6, 6.4, z), new THREE.Vector3(-7.6, 6.4, z), ["#e8344a", "#ffc93c", "#2ec4b6", "#ff8a1f", "#7a4fd6"], 18);
  for (const n of [1, 2, 3]) {
    const z = n === 1 ? SPOTS.india.chai : n === 2 ? SPOTS.india.mobile : SPOTS.india.pharmacy;
    const board = numberBoard(g, n, 0, z, 7.2, "#e8344a", "#ffc93c");
    board.rotation.y = Math.PI; // faces the camera that looks down the street toward +z
  }
  // far end of the street: a block of houses closing the view
  block(g, 40, 14, 8, "#f2d4a8", 0, 0, 72);
  block(g, 40, 14, 8, "#f2d4a8", 0, 0, -72);
  return g;
};

// ---------------- USA ----------------
const buildUsa = () => {
  const g = new THREE.Group();
  const roadTex = asphaltTexture("#4e5560", "#20252d");
  floor(g, -8, 8, -70, 70, painted(roadTex), 0, 3);
  floor(g, 8, 11, -70, 70, painted(pavingTexture("#d4d8de", "#aab0ba")), 0.14, 1.5);
  floor(g, -11, -8, -70, 70, painted(pavingTexture("#d4d8de", "#aab0ba")), 0.14, 1.5);
  floor(g, 11, 18, -70, 70, painted(roadTex), 0, 3);
  floor(g, 18, 80, -70, 70, solid("#7fcf6b"), 0, 1);
  floor(g, -80, -11, -70, 70, solid("#7fcf6b"), 0, 1);
  block(g, 0.2, 0.14, 140, "#aab0ba", 8.05, 0, 0);
  block(g, 0.2, 0.14, 140, "#aab0ba", -8.05, 0, 0);
  for (let z = -66; z < 66; z += 6) block(g, 0.16, 0.02, 2.6, "#ffd23c", 0, 0, z);
  for (let z = -66; z < 66; z += 3.2) if (Math.abs(z % 6.4) < 0.1) block(g, 0.5, 0.02, 2.4, "#f4f4f4", 11.6, 0, z);

  const right: Row[] = [
    {z: -26, spec: {w: 14, h: 12, depth: 12, wall: "#8fb3dc", roof: "#5d7fa8", glass: "#d9ecff", sign: {text: "BANK", bg: "#17124a", fg: "#ffc93c"}, floors: 4}},
    {z: -8, spec: {w: 10, h: 6.5, depth: 10, wall: "#f2f4f7", roof: "#b9bfc9", glass: "#bfe8ff", sign: {text: "WIRELESS", bg: "#e8344a", fg: "#ffffff"}, awning: ["#b9bfc9", "#f2f4f7"], goods: ["#23232b", "#2f6bff", "#ffffff", "#e8344a"], floors: 2}},
    {z: 10, spec: {w: 12, h: 8, depth: 12, wall: "#e6f1f5", roof: "#b9c9cf", glass: "#bfe8ff", sign: {text: "CLINIC", bg: "#2ec4b6", fg: "#ffffff"}, awning: ["#2ec4b6", "#ffffff"], floors: 3}},
    {z: 28, spec: {w: 14, h: 6.5, depth: 12, wall: "#c4584a", roof: "#8a3f35", glass: "#fff4de", sign: {text: "GROCERY", bg: "#1d6b3a", fg: "#ffffff"}, awning: ["#1d6b3a", "#ffffff"], goods: ["#e8344a", "#3ddc84", "#ffc93c", "#ffffff"], floors: 2}},
  ];
  row(g, right, 18, -1);
  for (const [z, c, yaw] of [[-20, "#e8344a", Math.PI / 2], [-14.5, "#f4f4f4", Math.PI / 2], [-3, "#2f6bff", Math.PI / 2], [3.5, "#23232b", Math.PI / 2], [16, "#ffc93c", Math.PI / 2], [22, "#7a4fd6", Math.PI / 2], [-30, "#3ddc84", Math.PI / 2]] as const) car(g, 14.4, z, c, yaw);
  // traffic stays in the far lane, away from the cameras
  for (const [x, z, c, yaw] of [[-3.2, -30, "#ffc93c", Math.PI], [3.2, -48, "#f4f4f4", 0]] as const) car(g, x, z, c, yaw);
  for (const z of [-34, -14, 4, 22]) lampPost(g, 9.2, z, 6.5, "#2b3140");
  for (const z of [-40, 19, 36]) tree(g, 9.8, z, 5.2, "#5bb04e");
  for (const z of [-40, -20, 0, 20, 40]) tree(g, -13, z, 6, "#5bb04e");
  block(g, 14, 6, 8, "#e9e2d6", -24, 0, -20);
  block(g, 14, 6, 8, "#d8e3ee", -24, 0, 6);
  block(g, 40, 14, 8, "#cfd6e0", 0, 0, 72);
  block(g, 40, 14, 8, "#cfd6e0", 0, 0, -72);
  return g;
};

export type SetName = "india" | "usa";

/** both streets, each moved to its own corner of the world */
export const buildSets = (): Record<SetName, THREE.Group> => {
  const india = buildIndia();
  const usa = buildUsa();
  india.position.x = INDIA_X;
  usa.position.x = USA_X;
  return {india, usa};
};
