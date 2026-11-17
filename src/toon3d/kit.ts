// Building blocks for painted toon worlds: shared materials, hand-painted canvas textures, and small builders
// (shop fronts, trees, cars, scooters, lamp posts, number boards). Everything is deterministic: same call, same pixels.
import * as THREE from "three";
import {ctex} from "./paint";
import {twoTone} from "./shade";
import {INK} from "./toon";

const FONT = '"Helvetica Neue", Inter, Arial, sans-serif';

// ---------------- materials ----------------
const solids = new Map<string, THREE.MeshLambertMaterial>();
/** flat colour with the shared two-tone lighting */
export const solid = (color: string) => {
  let m = solids.get(color);
  if (!m) {
    m = twoTone(new THREE.MeshLambertMaterial({color}));
    solids.set(color, m);
  }
  return m;
};

const paintedMats = new Map<string, THREE.MeshLambertMaterial>();
/** a painted texture with the shared two-tone lighting */
export const painted = (map: THREE.Texture) => {
  let m = paintedMats.get(map.uuid);
  if (!m) {
    m = twoTone(new THREE.MeshLambertMaterial({map}));
    paintedMats.set(map.uuid, m);
  }
  return m;
};

const unlitMats = new Map<string, THREE.MeshBasicMaterial>();
/** an unlit painted face (signs): lit by a side sun they would go grey and unreadable */
export const unlit = (map: THREE.Texture) => {
  let m = unlitMats.get(map.uuid);
  if (!m) {
    m = new THREE.MeshBasicMaterial({map, color: new THREE.Color(0.92, 0.92, 0.92)});
    unlitMats.set(map.uuid, m);
  }
  return m;
};

type MatLike = string | THREE.Material;
const mat = (m: MatLike) => (typeof m === "string" ? solid(m) : m);

// ---------------- primitives ----------------
const shadowed = <T extends THREE.Object3D>(o: T) => {
  o.traverse((c) => {
    c.castShadow = true;
    c.receiveShadow = true;
  });
  return o;
};

/** a box standing on y0, centred on (x, z) */
export const block = (parent: THREE.Object3D, w: number, h: number, d: number, m: MatLike | MatLike[], x: number, y0: number, z: number) => {
  const mats = Array.isArray(m) ? m.map(mat) : mat(m);
  const mesh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats));
  mesh.position.set(x, y0 + h / 2, z);
  parent.add(mesh);
  return mesh;
};

/** an upright cylinder standing on y0 */
export const post = (parent: THREE.Object3D, r: number, h: number, m: MatLike, x: number, y0: number, z: number, segments = 12) => {
  const mesh = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segments), mat(m)));
  mesh.position.set(x, y0 + h / 2, z);
  parent.add(mesh);
  return mesh;
};

/** a flat horizontal plane at height y, covering x0..x1, z0..z1 */
export const floor = (parent: THREE.Object3D, x0: number, x1: number, z0: number, z1: number, m: THREE.Material, y = 0, tile = 1) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (x1 - x0)) / tile, (uv.getY(i) * (z1 - z0)) / tile);
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

// ---------------- painted textures ----------------
/** a shop sign: ink-rimmed plate with bold text */
export const signTexture = (text: string, bg: string, fg: string, w = 512, h = 160) =>
  ctex(`sign|${text}|${bg}|${fg}|${w}x${h}`, w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.lineWidth = 14;
    g.strokeStyle = INK;
    g.strokeRect(7, 7, w - 14, h - 14);
    g.fillStyle = fg;
    g.textAlign = "center";
    let size = h * 0.62;
    g.font = `800 ${size}px ${FONT}`;
    const maxW = w * 0.86;
    const measured = g.measureText(text).width;
    if (measured > maxW) {
      size = (size * maxW) / measured;
      g.font = `800 ${size}px ${FONT}`;
    }
    g.fillText(text, w / 2, h / 2 + size * 0.34);
  });

/** a big number on a banner (chapter sign) */
export const numberTexture = (n: number, bg: string, fg: string) =>
  ctex(`number|${n}|${bg}|${fg}`, 512, 384, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 512, 384);
    g.lineWidth = 22;
    g.strokeStyle = INK;
    g.strokeRect(11, 11, 490, 362);
    g.lineWidth = 8;
    g.strokeStyle = fg;
    g.strokeRect(34, 34, 444, 316);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.font = `800 300px ${FONT}`;
    g.fillText(String(n), 256, 290);
  });

/** a front wall: windows in rows and columns above a plain ground-floor band */
export const facadeTexture = (key: string, o: {wall: string; glass: string; frame: string; cols: number; rows: number; ground: number}) =>
  ctex(`facade|${key}`, 512, 512, (g) => {
    g.fillStyle = o.wall;
    g.fillRect(0, 0, 512, 512);
    const usable = 512 * (1 - o.ground);
    const cellW = 512 / o.cols;
    const cellH = usable / o.rows;
    for (let r = 0; r < o.rows; r++) {
      for (let c = 0; c < o.cols; c++) {
        const w = cellW * 0.52;
        const h = cellH * 0.56;
        const x = c * cellW + (cellW - w) / 2;
        const y = r * cellH + (cellH - h) / 2 + 8;
        g.fillStyle = o.frame;
        g.fillRect(x - 8, y - 8, w + 16, h + 16);
        g.fillStyle = o.glass;
        g.fillRect(x, y, w, h);
        g.lineWidth = 6;
        g.strokeStyle = INK;
        g.strokeRect(x - 8, y - 8, w + 16, h + 16);
        g.beginPath();
        g.moveTo(x + w / 2, y);
        g.lineTo(x + w / 2, y + h);
        g.stroke();
        g.fillStyle = o.frame;
        g.fillRect(x - 14, y + h + 8, w + 28, 10);
      }
    }
  });

/** shelves of coloured goods behind a counter */
export const shelvesTexture = (key: string, colors: string[], back = "#4a2f27") =>
  ctex(`shelves|${key}`, 512, 256, (g, r) => {
    g.fillStyle = back;
    g.fillRect(0, 0, 512, 256);
    const rows = 4;
    for (let row = 0; row < rows; row++) {
      const y = 12 + row * 62;
      g.fillStyle = "#2b1a16";
      g.fillRect(0, y + 46, 512, 10);
      for (let x = 10; x < 500; ) {
        const w = 26 + Math.floor(r() * 26);
        const h = 24 + Math.floor(r() * 22);
        g.fillStyle = colors[Math.floor(r() * colors.length) % colors.length];
        g.fillRect(x, y + 46 - h, w, h);
        g.lineWidth = 3;
        g.strokeStyle = INK;
        g.strokeRect(x, y + 46 - h, w, h);
        x += w + 5;
      }
    }
  });

/** an awning: alternating vertical stripes */
export const stripesTexture = (a: string, b: string) =>
  ctex(`stripes|${a}|${b}`, 256, 64, (g) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect(i * 32, 0, 32, 64);
    }
    g.lineWidth = 6;
    g.strokeStyle = INK;
    g.strokeRect(0, 0, 256, 64);
  });

/** ground textures: asphalt with specks, paving slabs, a lane marking */
export const asphaltTexture = (base: string, speck: string) =>
  ctex(`asphalt|${base}`, 256, 256, (g, r) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = speck;
      g.globalAlpha = 0.18 + r() * 0.2;
      g.fillRect(r() * 256, r() * 256, 2 + r() * 4, 2 + r() * 3);
    }
    g.globalAlpha = 1;
  });

export const pavingTexture = (base: string, line: string) =>
  ctex(`paving|${base}`, 256, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = line;
    g.lineWidth = 4;
    for (let i = 0; i <= 4; i++) {
      g.beginPath();
      g.moveTo(i * 64, 0);
      g.lineTo(i * 64, 256);
      g.moveTo(0, i * 64);
      g.lineTo(256, i * 64);
      g.stroke();
    }
  });

/** a pseudo QR code plate for the scan-to-pay stand */
export const qrTexture = () =>
  ctex("qr", 256, 320, (g, r) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 256, 320);
    g.lineWidth = 10;
    g.strokeStyle = INK;
    g.strokeRect(5, 5, 246, 310);
    const n = 11;
    const cell = 17;
    const x0 = (256 - n * cell) / 2;
    const y0 = 34;
    const finder = (row: number, col: number) => (row < 3 && col < 3) || (row < 3 && col >= n - 3) || (row >= n - 3 && col < 3);
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (finder(row, col) || r() > 0.5) {
          g.fillStyle = INK;
          g.fillRect(x0 + col * cell, y0 + row * cell, cell, cell);
        }
      }
    }
    g.fillStyle = "#2f6bff";
    g.textAlign = "center";
    g.font = `800 40px ${FONT}`;
    g.fillText("SCAN & PAY", 128, 290);
  });

// ---------------- shop front ----------------
export type ShopSpec = {
  w: number;
  h: number;
  depth: number;
  wall: string;
  roof: string;
  glass: string;
  sign: {text: string; bg: string; fg: string};
  /** awning stripe colours; omit for none */
  awning?: [string, string];
  /** goods behind the counter */
  goods?: string[];
  floors: number;
};

/** A shop whose front faces +z, standing on y = 0 and centred on the origin. Ground opening 2.7 m tall. */
export const shopFront = (s: ShopSpec) => {
  const g = new THREE.Group();
  const upper = s.floors - 1;
  const groundFrac = Math.min(0.8, 2.9 / s.h);
  const front = painted(facadeTexture(`${s.wall}|${s.glass}|${s.w}x${s.h}`, {wall: s.wall, glass: s.glass, frame: "#fff4de", cols: Math.max(2, Math.round(s.w / 2)), rows: Math.max(1, upper), ground: groundFrac}));
  const wall = solid(s.wall);
  block(g, s.w, s.h, s.depth, [wall, wall, solid(s.roof), wall, front, wall], 0, 0, 0);
  block(g, s.w + 0.3, 0.45, s.depth + 0.3, s.roof, 0, s.h, 0);
  const z = s.depth / 2;
  // ground-floor opening with goods and a counter
  const openingW = s.w * 0.84;
  const openingMat = s.goods ? painted(shelvesTexture(s.goods.join(""), s.goods)) : solid("#3a2a2a");
  const opening = new THREE.Mesh(new THREE.PlaneGeometry(openingW, 2.5), openingMat);
  opening.position.set(0, 1.45, z + 0.02);
  g.add(opening);
  block(g, openingW + 0.4, 0.2, 0.2, "#fff4de", 0, 2.7, z + 0.05);
  block(g, openingW, 1.05, 0.75, "#8a5a3c", 0, 0, z + 0.45);
  block(g, openingW + 0.1, 0.1, 0.9, "#e6c9a0", 0, 1.05, z + 0.45);
  if (s.awning) {
    const awn = shadowed(new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.96, 0.12, 1.7), painted(stripesTexture(...s.awning))));
    awn.position.set(0, 3.15, z + 0.85);
    awn.rotation.x = 0.26;
    g.add(awn);
  }
  // sign plate above the awning, unlit front face
  const plateH = 0.95;
  const plate = shadowed(new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.9, plateH, 0.14), [solid(INK), solid(INK), solid(INK), solid(INK), unlit(signTexture(s.sign.text, s.sign.bg, s.sign.fg, 512, Math.round((512 * plateH) / (s.w * 0.9)))), solid(INK)]));
  plate.position.set(0, 3.95, z + 0.08);
  g.add(plate);
  return g;
};

// ---------------- props ----------------
export const tree = (parent: THREE.Object3D, x: number, z: number, h = 5, leaf = "#4fa84a") => {
  post(parent, 0.18, h * 0.55, "#8a5a3c", x, 0, z, 8);
  for (const [dx, dy, dz, r] of [[0, h * 0.72, 0, h * 0.34], [h * 0.16, h * 0.58, h * 0.08, h * 0.26], [-h * 0.14, h * 0.62, -h * 0.1, h * 0.27]] as const) {
    const m = shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), solid(leaf)));
    m.position.set(x + dx, dy, z + dz);
    parent.add(m);
  }
};

export const lampPost = (parent: THREE.Object3D, x: number, z: number, h = 5.4, color = "#3d4350") => {
  post(parent, 0.09, h, color, x, 0, z, 8);
  block(parent, 0.7, 0.18, 0.28, color, x, h, z);
  block(parent, 0.5, 0.08, 0.2, "#fff2c0", x, h - 0.08, z);
};

const wheel = (parent: THREE.Object3D, x: number, y: number, z: number, r: number, width: number) => {
  const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r, r, width, 14), solid("#23232b")));
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  parent.add(m);
};

/** a car along the x axis (nose toward +x) */
export const car = (parent: THREE.Object3D, x: number, z: number, color: string, yaw = 0) => {
  const g = new THREE.Group();
  block(g, 4.4, 0.85, 1.9, color, 0, 0.35, 0);
  block(g, 2.3, 0.8, 1.7, "#bfe8ff", -0.2, 1.2, 0);
  block(g, 2.34, 0.14, 1.74, color, -0.2, 2.0, 0);
  for (const [wx, wz] of [[1.4, 0.95], [1.4, -0.95], [-1.4, 0.95], [-1.4, -0.95]]) wheel(g, wx, 0.38, wz, 0.38, 0.28);
  g.position.set(x, 0, z);
  g.rotation.y = yaw;
  parent.add(g);
};

/** a parked scooter along the x axis */
export const scooter = (parent: THREE.Object3D, x: number, z: number, color: string, yaw = 0) => {
  const g = new THREE.Group();
  block(g, 1.5, 0.5, 0.5, color, 0, 0.35, 0);
  block(g, 0.7, 0.14, 0.45, "#23232b", -0.25, 0.85, 0);
  block(g, 0.18, 0.9, 0.18, "#555b66", 0.7, 0.3, 0);
  block(g, 0.12, 0.12, 0.7, "#555b66", 0.7, 1.2, 0);
  wheel(g, 0.6, 0.27, 0, 0.27, 0.16);
  wheel(g, -0.6, 0.27, 0, 0.27, 0.16);
  g.position.set(x, 0, z);
  g.rotation.y = yaw;
  parent.add(g);
};

/** a chapter board hung from a cable across the street (no poles in the way); faces +z, board centre at `height` */
export const numberBoard = (parent: THREE.Object3D, n: number, x: number, z: number, height: number, bg: string, fg: string, span = 16) => {
  const g = new THREE.Group();
  const w = 4.4;
  const h = 3.3;
  const cableY = height + h / 2 + 0.9;
  block(g, span, 0.08, 0.08, INK, 0, cableY, 0);
  for (const dx of [-w / 2 + 0.4, w / 2 - 0.4]) block(g, 0.06, 0.9, 0.06, INK, dx, height + h / 2, 0);
  const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), [solid(INK), solid(INK), solid(INK), solid(INK), unlit(numberTexture(n, bg, fg)), solid(INK)]));
  board.position.set(0, height, 0);
  g.add(board);
  g.position.set(x, 0, z);
  parent.add(g);
  return g;
};

/** a rope with triangular pennants between two points */
export const bunting = (parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, colors: string[], count = 14) => {
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    const p = a.clone().lerp(b, u);
    p.y -= Math.sin(u * Math.PI) * 0.5;
    const tri = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 3), solid(colors[i % colors.length])));
    tri.rotation.set(Math.PI, 0, 0);
    tri.position.set(p.x, p.y - 0.25, p.z);
    parent.add(tri);
  }
  const rope = a.distanceTo(b);
  const mesh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, rope), solid(INK)));
  mesh.position.copy(a.clone().lerp(b, 0.5));
  mesh.lookAt(b);
  parent.add(mesh);
};

// ---------------- more shapes and props ----------------
/** an upright cone standing on y0 (4 segments = a pyramid) */
export const cone = (parent: THREE.Object3D, r: number, h: number, m: MatLike, x: number, y0: number, z: number, segments = 16, yaw = 0) => {
  const mesh = shadowed(new THREE.Mesh(new THREE.ConeGeometry(r, h, segments), mat(m)));
  mesh.position.set(x, y0 + h / 2, z);
  mesh.rotation.y = yaw;
  parent.add(mesh);
  return mesh;
};

/** a rounded lump (hill, bush, mound) sitting on y0: an icosphere squashed to `h` tall */
export const mound = (parent: THREE.Object3D, r: number, h: number, m: MatLike, x: number, y0: number, z: number) => {
  const mesh = shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), mat(m)));
  mesh.scale.y = h / r;
  mesh.position.set(x, y0, z);
  parent.add(mesh);
  return mesh;
};

/** a flat sign whose face looks toward -z (the usual camera side) when yaw = 0; centre at (x, y, z) */
export const signBoard = (parent: THREE.Object3D, text: string, bg: string, fg: string, w: number, h: number, x: number, y: number, z: number, yaw = 0) => {
  const face = unlit(signTexture(text, bg, fg, 512, Math.max(64, Math.round((512 * h) / w))));
  const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), [solid(INK), solid(INK), solid(INK), solid(INK), solid(INK), face]));
  board.position.set(x, y, z);
  board.rotation.y = yaw;
  parent.add(board);
  return board;
};

/** a steel milk can, 0.75 m tall */
export const milkCan = (parent: THREE.Object3D, x: number, y0: number, z: number) => {
  post(parent, 0.25, 0.5, "#c9d1d9", x, y0, z, 14);
  post(parent, 0.15, 0.17, "#aeb7c0", x, y0 + 0.5, z, 14);
  post(parent, 0.19, 0.08, "#c9d1d9", x, y0 + 0.67, z, 14);
};

/** a red pillar letter box, 1.5 m tall */
export const letterBox = (parent: THREE.Object3D, x: number, z: number, y0 = 0) => {
  post(parent, 0.34, 0.12, INK, x, y0, z, 16);
  post(parent, 0.3, 1.2, "#d7263d", x, y0 + 0.12, z, 16);
  post(parent, 0.36, 0.14, INK, x, y0 + 1.32, z, 16);
  cone(parent, 0.34, 0.2, "#d7263d", x, y0 + 1.46, z, 16);
  block(parent, 0.3, 0.07, 0.04, INK, x, y0 + 1.05, z - 0.3);
};
