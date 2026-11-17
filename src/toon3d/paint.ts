// Hand-painted textures drawn on canvases and cached by key: the generic painter `ctex`, grass, water and the cloud sprite.
// World-specific textures (signs, facades, asphalt ...) live in kit.ts, built on ctex.
import * as THREE from "three";

export const rng = (seed: number) => {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};
const cache = new Map<string, THREE.CanvasTexture>();
export const ctex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void) => {
  let t = cache.get(key);
  if (!t) {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    draw(cv.getContext("2d")!, rng(key.length * 131 + key.charCodeAt(0)));
    t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    cache.set(key, t);
  }
  return t;
};

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length) % a.length];
type R = () => number;
const U = (r: R, a: number, b: number) => a + (b - a) * r();
const TAU = Math.PI * 2;

export const grass = () => ctex("grass", 512, 512, (g, r) => {
  g.fillStyle = "#79b950"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) { g.fillStyle = pick(r, ["rgba(96,160,60,.35)", "rgba(140,205,95,.3)"]); g.beginPath(); g.ellipse(r() * 512, r() * 512, 30 + r() * 60, 18 + r() * 30, r() * 3, 0, 7); g.fill(); }
  g.lineCap = "round";
  for (let i = 0; i < 2600; i++) {
    const x = r() * 512, y = r() * 512, l = 5 + r() * 8;
    g.strokeStyle = pick(r, ["#5f9c3d", "#8fcc5f", "#6aa844", "#9ad46a"]); g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - l); g.stroke();
  }
  for (let i = 0; i < 30; i++) { g.fillStyle = pick(r, ["#fff7d0", "#ffe066", "#ffb3c8"]); g.beginPath(); g.arc(r() * 512, r() * 512, 3, 0, 7); g.fill(); }
});

export const water = () => ctex("water", 512, 512, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#3d92da"); gr.addColorStop(0.5, "#3487d0"); gr.addColorStop(1, "#3d92da");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  g.lineCap = "round";
  for (let i = 0; i < 90; i++) {
    const x = r() * 512, y = r() * 512, l = 30 + r() * 70;
    g.strokeStyle = pick(r, ["rgba(140,205,245,.55)", "rgba(110,185,240,.5)", "rgba(220,245,255,.55)"]); g.lineWidth = 3 + r() * 3;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke();
  }
  for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect(r() * 512, r() * 512, 6 + r() * 8, 2); }
});

/** the three tones of a cloud: sunlit crown, mid band, underside */
export type CloudPalette = {lit: string; mid: string; shade: string};

/** Cloud sprite, 1024 x 512: three painted tones and a flat soft bottom, no outline. */
export const cloudHD = (seed: number, pal: CloudPalette) => ctex(`cloudHD_${pal.lit}_${seed}`, 1024, 512, (g) => {
  const r = rng(seed * 7919 + 17); // own seed: ctex keys of equal length would otherwise share shapes
  const W = 1024, H = 512, base = 400;
  const n = 6 + Math.floor(r() * 4), lobes: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < n; i++) { // main row, biggest in the middle
    const t = (i + 0.5) / n, rad = (60 + 110 * Math.sin(Math.PI * t) ** 0.8) * U(r, 0.75, 1.15);
    lobes.push({ x: 150 + t * 724 + U(r, -30, 30), y: base - rad * U(r, 0.35, 0.65), r: rad });
  }
  for (let i = 0; i < Math.floor(n / 2); i++) { // crown
    const t = U(r, 0.25, 0.75), rad = U(r, 60, 110);
    lobes.push({ x: 150 + t * 724, y: base - 150 - rad * U(r, 0.3, 0.7), r: rad });
  }
  const layer = (dx: number, dy: number, k: number, col: string, blur: number) => {
    g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = col; g.beginPath();
    for (const l of lobes) { const x = l.x + dx * l.r, y = l.y + dy * l.r; g.moveTo(x + l.r * k, y); g.arc(x, y, l.r * k, 0, TAU); }
    g.fill(); g.restore();
  };
  layer(0, 0, 1.0, pal.shade, 6);         // silhouette in the underside tone
  layer(-0.04, -0.12, 0.9, pal.mid, 8);   // mid band
  layer(-0.1, -0.26, 0.72, pal.lit, 10);  // sunlit crown, offset up-left
  g.globalCompositeOperation = "destination-in"; // flat, soft bottom
  const m = g.createLinearGradient(0, base - 18, 0, base + 6);
  m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = m; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "source-over";
});
