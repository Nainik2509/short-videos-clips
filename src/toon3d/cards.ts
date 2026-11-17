// Characters and effects as flat cards in the 3D world. Each frame every card asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing. Characters are yaw-only billboards shaded by cardShade() (scene
// tint, side gradient toward the sun); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {Pen, fxBlob} from "./toon";
import {NOINK} from "./ink";
import {cardShade, blobMaterial, CARD_K} from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = {cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number};
type Req = {key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture};

const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return {cv, tex, w, h};
};

class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = {key: `${w}x${h}|${key}`, w, h, k, draw};
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) {
      const list = want.get(r.key);
      if (list) list.push(r);
      else want.set(r.key, [r]);
    }
    for (const [key, e] of this.live) {
      if (!want.has(key)) {
        this.live.delete(key);
        this.free.push(e);
      }
    }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0];
        const i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, e.w, e.h);
        g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- card meshes ----------------
const blank = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 2;
  return new THREE.CanvasTexture(c);
})();
/** metres per design unit: a 1000-unit tall card is 2.16 m */
export const SU = 0.00216;
const BODY = (() => {
  const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU);
  g.translate(0, (975 - 500) * SU, 0); // feet (design y 975) on the mesh origin
  return g;
})();
const QUAD = new THREE.PlaneGeometry(1, 1);

class Actor {
  mesh: THREE.Mesh;
  mat: THREE.MeshLambertMaterial;
  req: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({map: blank, alphaTest: 0.5, side: THREE.DoubleSide}));
    this.mat.alphaToCoverage = false;
    const depth = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide});
    this.mesh = new THREE.Mesh(BODY, this.mat);
    this.mesh.customDepthMaterial = depth;
    this.mesh.onBeforeRender = (r) => {
      const rt = r.getRenderTarget();
      CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920;
    };
    this.mesh.receiveShadow = true;
    this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ";
    this.mesh.renderOrder = 1;
    this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() {
    const t = this.req?.tex;
    if (!t) return;
    this.mat.map = t;
    (this.mesh.customDepthMaterial as THREE.MeshDepthMaterial).map = t;
  }
}

class Fx {
  mesh: THREE.Mesh;
  hard: THREE.MeshBasicMaterial;
  blob: THREE.MeshBasicMaterial;
  req: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.hard = new THREE.MeshBasicMaterial({map: blank, alphaTest: 0.5, side: THREE.DoubleSide});
    this.hard.alphaToCoverage = false;
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(QUAD, this.hard);
    this.mesh.visible = false;
    this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() {
    const t = this.req?.tex;
    if (!t) return;
    if (this.req!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) {
        t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter;
        t.needsUpdate = true;
      }
      this.blob.map = t;
      this.mesh.material = this.blob;
      this.mesh.renderOrder = 0.5;
    } else {
      this.hard.map = t;
      this.mesh.material = this.hard;
      this.mesh.renderOrder = 0;
    }
  }
}

// ---------------- placements (what a shot asks for each frame) ----------------
/** a character card standing at (x, y, z) with its feet on y */
export type Place = {
  key: string;
  draw: (p: Pen) => void;
  x: number;
  y: number;
  z: number;
  scale?: number;
  mirror?: boolean;
  /** drawing size [canvas w, canvas h, scale from the 600 x 1000 design] */
  size?: [number, number, number];
};
/** an effect card (icon, label) centred on (x, y, z), w x h metres, facing the camera */
export type FxPlace = {key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number};

/** drawing resolution by distance from the lens; sized for the 1080x1920 render and sharp enough for 1440x2560 */
export const tierFor = (distance: number): [number, number, number] =>
  distance < 4 ? [1200, 2000, 2.0] : distance < 9 ? [720, 1200, 1.2] : [360, 600, 0.6];

/** contact blob under a standing card (multiply: darkens the ground a little) */
export const blobPlace = (x: number, y: number, z: number, w = 1.5): FxPlace => ({
  key: "blob|day", cw: 128, ch: 128, draw: (p) => fxBlob(p, "#9f9a9c"), x, y: y + 0.015, z, w, h: w,
});

/** All cards of the scene: pooled canvases and meshes, posed per frame. */
export class Cast {
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4();
  private v = new THREE.Vector3();
  private sphere = new THREE.Sphere();
  constructor(private root: THREE.Object3D) {}

  private actor(i: number) {
    while (this.actors.length <= i) this.actors.push(new Actor(this.root));
    return this.actors[i];
  }
  private fx(i: number) {
    while (this.fxs.length <= i) this.fxs.push(new Fx(this.root));
    return this.fxs[i];
  }

  /** pose every card for this frame; cards behind the lens or outside the frame are skipped */
  update(places: Place[], effects: FxPlace[], cam: THREE.PerspectiveCamera, castShadows: boolean) {
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const usedActors: Actor[] = [];
    for (const p of places) {
      const sc = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sphere.set(this.v.set(p.x, p.y + 1.1 * sc, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [600, 1000, 1];
      a.req = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -sc : sc, sc, sc);
      a.mesh.castShadow = castShadows;
      usedActors.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;

    let fi = 0;
    const usedFx: Fx[] = [];
    for (const p of effects) {
      if (!this.frustum.intersectsSphere(this.sphere.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.req = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.key.startsWith("blob|")) e.mesh.rotation.set(-Math.PI / 2, 0, 0);
      else e.mesh.quaternion.copy(cam.quaternion);
      e.mesh.scale.set(p.w, p.h, 1);
      usedFx.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;

    this.pool.flush();
    for (const a of usedActors) a.bind();
    for (const e of usedFx) e.bind();
  }
}
