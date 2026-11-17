// The places of "The Last Over": a dusty Ranchi football ground, a railway platform, an India-blue stadium, a
// Chennai-yellow stadium (with a dugout bench and a bat lying on the grass as a second stage) and a hall with a
// podium and a trophy shelf. One set shows at a time; the camera stands at z < 0 and looks toward +z.
// A set with a second stage keeps it at x = SIDE.
import * as THREE from "three";
import {asphaltTexture, block, bunting, cone, facadeTexture, floor, lampPost, mound, painted, pavingTexture, post, shadowed, signBoard, solid, tree} from "../../toon3d/kit";
import {ctex} from "../../toon3d/paint";
import {INK} from "../../toon3d/toon";

export type SetName = "ranchi" | "station" | "stadiumBlue" | "stadiumYellow" | "hall";

export const SIDE = 40;

/** distance from the stumps to the popping crease line, in metres */
const CREASE = 1.2;

const MIDNIGHT = "#17124a";
const MARIGOLD = "#ffc93c";
const PAPER = "#fff4de";
const BLUE = "#1f4fd8";
const YELLOW = "#ffd23c";
const SAFFRON = "#ff8a1f";

/** fixed points the shots aim at, in metres */
export const SPOTS = {
  ranchi: {goalZ: 7},
  station: {edgeZ: 4.6, trainZ: 9},
  /** batter's stumps are at z = 0, bowler's at z = pitchLen */
  stadium: {pitchLen: 14, ringZ: 7, ringR: 52},
  hall: {podiumZ: 6, shelfX: SIDE, shelfZ: 6},
} as const;

/** a flat ring on the ground (boundary rope) */
const ring = (parent: THREE.Object3D, cx: number, cz: number, rIn: number, rOut: number, color: string, y = 0.03) => {
  const g = new THREE.RingGeometry(rIn, rOut, 96);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, solid(color));
  m.position.set(cx, y, cz);
  m.receiveShadow = true;
  parent.add(m);
};

// ---------------- crowd and grass textures ----------------
const crowdTexture = (key: string, colors: string[]) =>
  ctex(`crowd|${key}`, 512, 256, (g, r) => {
    g.fillStyle = "#2b2740";
    g.fillRect(0, 0, 512, 256);
    for (let row = 0; row < 7; row++) {
      for (let i = 0; i < 40; i++) {
        const x = i * 13 + (row % 2) * 6 + r() * 3;
        const y = 14 + row * 34;
        g.fillStyle = colors[Math.floor(r() * colors.length) % colors.length];
        g.beginPath();
        g.arc(x, y + 8, 7.5, 0, Math.PI * 2);
        g.fill();
        g.fillRect(x - 6, y + 12, 12, 14);
        g.fillStyle = "#f3d3b0";
        g.beginPath();
        g.arc(x, y, 5, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

const mowTexture = () =>
  ctex("mow", 512, 512, (g, r) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? "#6cba52" : "#5ea947";
      g.fillRect(i * 64, 0, 64, 512);
    }
    for (let i = 0; i < 500; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)";
      g.fillRect(r() * 512, r() * 512, 3, 7);
    }
  });

// ---------------- the cricket ground ----------------
const stumps = (parent: THREE.Object3D, z: number) => {
  for (const x of [-0.11, 0, 0.11]) post(parent, 0.028, 0.72, "#f2e6cf", x, 0, z, 8);
  for (const x of [-0.055, 0.055]) block(parent, 0.11, 0.025, 0.03, MARIGOLD, x, 0.72, z);
};

/** a tiered crowd stand curving round the ground, with floodlight towers and an ad-board fence on the rope */
const buildStadium = (stand: string[], boards: string[], withBench: boolean) => {
  const g = new THREE.Group();
  const {pitchLen, ringZ, ringR} = SPOTS.stadium;
  floor(g, -160, 200, -90, 200, painted(mowTexture()), 0, 8);
  ring(g, 0, ringZ, ringR - 0.25, ringR + 0.25, "#fffaf2");
  // pitch, creases, stumps
  block(g, 3.2, 0.04, pitchLen + 6, "#efe4c0", 0, 0, pitchLen / 2);
  for (const z of [CREASE, pitchLen - CREASE]) block(g, 3.0, 0.045, 0.08, "#fffaf2", 0, 0, z);
  stumps(g, 0);
  stumps(g, pitchLen);
  // the crowd: 3 tiers per segment, faces toward the ground
  const crowd = painted(crowdTexture(stand.join(""), stand));
  const back = solid("#3b3656");
  for (let i = -26; i <= 26; i++) {
    const a = (i / 26) * (Math.PI * 0.62);
    const seg = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      block(seg, 11.2, 2.4, 3.2, [back, back, solid("#4a4570"), back, back, crowd], 0, k * 2.4, ringR + 3 + k * 3.1);
    }
    // a holder at the middle of the ground, turned to this segment's angle: the stand sits on the ring and faces the middle
    const holder = new THREE.Group();
    holder.position.set(0, 0, ringZ);
    holder.rotation.y = a;
    holder.add(seg);
    g.add(holder);
  }
  // advertisement boards on the rope (plain colour bands, no brands)
  for (let i = -26; i <= 26; i++) {
    const a = (i / 26) * (Math.PI * 0.62);
    const x = Math.sin(a) * (ringR + 1.2);
    const z = ringZ + Math.cos(a) * (ringR + 1.2);
    const b = block(g, 5.6, 1, 0.3, boards[(i + 26) % boards.length], x, 0, z);
    b.rotation.y = a;
  }
  // floodlight towers
  for (const a of [-0.9, -0.38, 0.38, 0.9]) {
    const x = Math.sin(a) * (ringR + 14);
    const z = ringZ + Math.cos(a) * (ringR + 14);
    post(g, 0.5, 30, "#7c8499", x, 0, z, 8);
    const panel = block(g, 8, 4.5, 0.7, "#fff7d6", x, 30, z);
    panel.rotation.y = a;
  }
  if (withBench) {
    // second stage: a dugout bench with a roof, and a bat lying on the grass
    const bx = SIDE;
    block(g, 9, 0.5, 1.2, "#8a5a3c", bx, 0.45, 4);
    block(g, 9, 1.1, 0.25, "#e6c9a0", bx, 0.95, 4.55);
    for (const dx of [-4.4, 4.4]) post(g, 0.08, 3.4, INK, bx + dx, 0, 4.5, 8);
    block(g, 9.6, 0.2, 2.6, stand[0], bx, 3.4, 4.3);
    block(g, 9.6, 3.4, 0.2, "#d7d2c6", bx, 0, 5.4);
    // the bat on the grass (top view)
    const bat = new THREE.Group();
    block(bat, 0.22, 0.05, 0.85, "#e7c58b", 0, 0.02, 0);
    block(bat, 0.07, 0.05, 0.5, "#f2e6cf", 0, 0.02, 0.62);
    block(bat, 0.075, 0.052, 0.12, BLUE, 0, 0.021, 0.62);
    bat.position.set(bx + 3, 0, -8);
    bat.rotation.y = 0.5;
    g.add(bat);
    // a cap beside it
    mound(g, 0.28, 0.14, YELLOW, bx + 3.9, 0.02, -8.8);
  }
  return g;
};

// ---------------- Ranchi football ground ----------------
const buildRanchi = () => {
  const g = new THREE.Group();
  floor(g, -120, 120, -60, 120, painted(asphaltTexture("#d9b982", "#a07f4a")), 0, 3);
  // goal: two posts and a bar, white, with a back net drawn as a faint wall
  const {goalZ} = SPOTS.ranchi;
  for (const x of [-2.4, 2.4]) post(g, 0.07, 2.4, "#fffaf2", x, 0, goalZ, 10);
  block(g, 4.9, 0.14, 0.14, "#fffaf2", 0, 2.4, goalZ);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.4), new THREE.MeshLambertMaterial({color: "#e8e4da", transparent: true, opacity: 0.35}));
  net.position.set(0, 1.2, goalZ + 1.4);
  g.add(net);
  block(g, 6, 0.03, 0.08, "#fffaf2", 0, 0.01, goalZ - 1.8);
  // low brick wall and small houses behind the ground
  const brick = solid("#b5654a");
  block(g, 60, 1.6, 0.5, brick, 0, 0, 20);
  for (const [x, w, h, wall] of [[-16, 8, 6, "#f4a6c0"], [-6, 7, 5, "#ffe08a"], [5, 8.5, 6.5, "#9bd7e8"], [16, 7, 5.5, "#ffd9a0"], [-26, 7, 5, "#d8c7f3"], [26, 8, 6, "#f4a6c0"]] as const) {
    const front = painted(facadeTexture(`ranchi|${wall}|${h}`, {wall, glass: "#fff2c0", frame: PAPER, cols: 3, rows: 2, ground: 0.2}));
    const s = solid(wall);
    block(g, w, h, 6, [s, s, solid("#c9b9a0"), s, s, front], x, 0, 26);
  }
  for (const [x, z, h] of [[-10, 17, 5.5], [11, 18, 6], [-21, 15, 5], [22, 16, 5.2]] as const) tree(g, x, z, h, "#4fa84a");
  signBoard(g, "RANCHI", MARIGOLD, MIDNIGHT, 3.4, 0.9, -12, 3.2, 12);
  post(g, 0.07, 3, INK, -13.4, 0, 12, 6);
  post(g, 0.07, 3, INK, -10.6, 0, 12, 6);
  // a stack of old tyres and a kit bag
  for (let i = 0; i < 3; i++) post(g, 0.45, 0.25, "#2b2b33", 5.5, i * 0.25, 8, 14);
  return g;
};

// ---------------- railway platform ----------------
const trainCoach = (parent: THREE.Object3D, x: number, z: number, body: string) => {
  const windows = painted(facadeTexture(`coach|${body}`, {wall: body, glass: "#bfe8ff", frame: PAPER, cols: 5, rows: 1, ground: 0.34}));
  const s = solid(body);
  block(parent, 12, 3.6, 3, [s, s, solid("#9aa1ad"), s, s, windows], x, 0.5, z);
  block(parent, 12.1, 0.3, 3.05, "#f4ead8", x, 1.6, z);
  for (const dx of [-4, 4]) block(parent, 1.8, 0.7, 2.6, "#2b2b33", x + dx, 0, z);
};

const buildStation = () => {
  const g = new THREE.Group();
  floor(g, -90, 90, -30, 70, painted(pavingTexture("#c9c3b8", "#9a9488")), 0, 2);
  const {edgeZ, trainZ} = SPOTS.station;
  // yellow safety line, then the track bed below the platform edge
  block(g, 180, 0.03, 0.4, MARIGOLD, 0, 0, edgeZ - 0.6);
  floor(g, -90, 90, edgeZ, 20, painted(asphaltTexture("#5b5248", "#2a2420")), -0.9, 2);
  for (const z of [trainZ - 0.7, trainZ + 0.7]) block(g, 180, 0.12, 0.1, "#9aa1ad", 0, -0.9, z);
  // sleepers
  for (let x = -60; x <= 60; x += 1.2) block(g, 0.3, 0.1, 3, "#6b4a32", x, -0.9, trainZ);
  // the train: three coaches in blue and cream
  trainCoach(g, -13, trainZ + 3, "#3a6fd8");
  trainCoach(g, 0, trainZ + 3, "#3a6fd8");
  trainCoach(g, 13, trainZ + 3, "#3a6fd8");
  // canopy over the platform on posts, and the station name
  for (const x of [-22, 8, 18, 28]) post(g, 0.15, 5, "#3d4350", x, 0, -3, 8);
  block(g, 40, 0.3, 6, "#c0392b", 1, 5, -1);
  signBoard(g, "KHARAGPUR", MARIGOLD, MIDNIGHT, 6.4, 1.2, 1, 4.2, -3.8);
  signBoard(g, "PLATFORM 1", MIDNIGHT, PAPER, 3, 0.7, -9, 3.2, -3.8);
  for (const x of [-8, 10]) lampPost(g, x, -2.4, 4.6);
  // ticket booth and bench
  block(g, 3.2, 2.8, 2.4, "#f7d9c4", 12, 0, -1);
  block(g, 3.4, 0.2, 2.6, "#c0392b", 12, 2.8, -1);
  signBoard(g, "TICKETS", "#c0392b", PAPER, 2.4, 0.5, 12, 2.3, -2.25);
  block(g, 3, 0.15, 0.7, "#8a5a3c", -3, 0.5, 1);
  for (const dx of [-1.3, 1.3]) post(g, 0.06, 0.5, INK, -3 + dx, 0, 1, 6);
  // far hills and a water tower
  for (const [x, r, h] of [[-40, 28, 12], [14, 34, 14], [56, 26, 11]] as const) mound(g, r, h, "#6fbf5e", x, -2, 70);
  post(g, 2, 9, "#c9c3b8", 38, 0, 34, 12);
  cone(g, 3.4, 2, "#b9bfc9", 38, 9, 34, 12);
  return g;
};

// ---------------- the hall: a podium, and (second stage) a trophy shelf ----------------
const cup = (parent: THREE.Object3D, x: number, y0: number, z: number, s = 1) => {
  const gold = solid("#ffc93c");
  const dark = solid("#f2a900");
  const base = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.42 * s, 0.5 * s, 0.22 * s, 16), solid(BLUE)));
  base.position.set(x, y0 + 0.11 * s, z);
  const stem = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.14 * s, 0.7 * s, 10), dark));
  stem.position.set(x, y0 + 0.57 * s, z);
  const bowl = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.46 * s, 0.2 * s, 0.7 * s, 18), gold));
  bowl.position.set(x, y0 + 1.27 * s, z);
  parent.add(base, stem, bowl);
  for (const dx of [-0.52, 0.52]) {
    const handle = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.2 * s, 0.045 * s, 8, 14), dark));
    handle.position.set(x + dx * s, y0 + 1.3 * s, z);
    parent.add(handle);
  }
};

const buildHall = () => {
  const g = new THREE.Group();
  const {podiumZ, shelfX, shelfZ} = SPOTS.hall;
  floor(g, -60, 120, -30, 60, painted(pavingTexture("#1c2a6b", "#2b3d96")), 0, 2);
  // stage: a backdrop wall with a banner, a three-step podium and the trophy
  block(g, 34, 14, 0.5, MIDNIGHT, 0, 0, podiumZ + 6);
  signBoard(g, "T20 WORLD CUP 2007", MARIGOLD, MIDNIGHT, 4.6, 0.9, 0, 6.2, podiumZ + 5.6);
  block(g, 6, 0.4, 3.2, "#2f6bff", 0, 0, podiumZ);
  block(g, 4.2, 0.4, 2.4, SAFFRON, 0, 0.4, podiumZ);
  block(g, 2.6, 0.4, 1.7, MARIGOLD, 0, 0.8, podiumZ);
  cup(g, 0, 1.2, podiumZ, 1.4);
  for (const x of [-7, 7]) {
    post(g, 0.1, 6, INK, x, 0, podiumZ - 1, 8);
    block(g, 1.4, 0.8, 1.2, "#fff7d6", x, 6, podiumZ - 1);
  }
  for (const [x, c] of [[-10, "#e8344a"], [10, "#3ddc84"], [-13, MARIGOLD], [13, "#2ec4b6"]] as const) bunting(g, new THREE.Vector3(x - 3, 9, podiumZ + 5), new THREE.Vector3(x + 3, 9, podiumZ + 5), [c, PAPER], 6);

  // second stage: a trophy shelf, 2007 / 2011 / 2013 from screen left to right (world +x is screen left)
  block(g, 22, 10, 0.5, "#0f3b4a", shelfX, 0, shelfZ + 4);
  block(g, 18, 0.35, 2.2, "#8a5a3c", shelfX, 2.2, shelfZ + 2.6);
  for (const [dx, year, s] of [[5.4, "2007", 1.2], [0, "2011", 1.5], [-5.4, "2013", 1.2]] as const) {
    cup(g, shelfX + dx, 2.55, shelfZ + 2.6, s);
    signBoard(g, year, MARIGOLD, MIDNIGHT, 2.4, 0.9, shelfX + dx, 1.4, shelfZ + 1.45);
  }
  block(g, 20, 0.12, 0.3, MARIGOLD, shelfX, 7.4, shelfZ + 3.7);
  return g;
};

/** every set, built once */
export const buildSets = (): Record<SetName, THREE.Group> => ({
  ranchi: buildRanchi(),
  station: buildStation(),
  stadiumBlue: buildStadium(["#1f4fd8", "#3a7bff", "#ffc93c", "#fffaf2", "#17124a"], [BLUE, "#e8344a", MARIGOLD, "#2ec4b6", "#7a4fd6"], false),
  stadiumYellow: buildStadium(["#ffd23c", "#ffb400", "#fff2a0", "#17124a", "#1f4fd8"], [YELLOW, BLUE, "#fff2a0", "#e8344a"], true),
  hall: buildHall(),
});
