// Our cast as 2D stick-figure cards: round white head, thin black stick limbs, a vest, one hat. Drawn on a
// 600 x 1000 design canvas with the feet on y = 975, so every card shares one scale and one ground line.
// A drawing is a pure function of (look, mood, pose, held, phase, blink): the pool caches identical drawings.
import {INK, Pen} from "./toon";

export type Hat = "none" | "beanie" | "cap" | "topi" | "hair";
export type Extra = "glasses" | "moustache" | "coat" | "apron" | "tie" | "bindi";
export type Look = {head: string; vest: string; trim: string; hat: Hat; hatColor: string; extras?: Extra[]};
export type Mood = "neutral" | "smile" | "grin" | "laugh" | "shock" | "worry" | "relief";
export type Pose = "idle" | "wave" | "phone" | "cheer" | "point" | "hold" | "shrug" | "walk";
export type Held = "phone" | "card" | "receipt" | "strip" | "cup" | null;
export type FigureSpec = {look: Look; mood: Mood; pose: Pose; held: Held; phase: number; blink: boolean};

type P2 = [number, number];
const WHITE = "#fffaf2";
const HEAD: P2 = [300, 288];
const SHOULDER_L: P2 = [236, 462];
const SHOULDER_R: P2 = [364, 462];
const HIP_Y = 705;
const FOOT_Y = 968;
const LIMB = 20;

/** [elbow, hand] for each arm. `phase` (0..1) drives the wave and the walk swing. */
const armsFor = (pose: Pose, phase: number): {l: [P2, P2]; r: [P2, P2]} => {
  const swing = Math.sin(phase * Math.PI * 2);
  switch (pose) {
    case "wave":
      return {l: [[214, 565], [200, 665]], r: [[446, 450], [478, 300 + Math.sin(phase * Math.PI * 8) * 38]]};
    case "phone":
      return {l: [[214, 565], [200, 665]], r: [[480, 540], [472, 380]]};
    case "cheer":
      return {l: [[166, 390], [138, 236]], r: [[434, 390], [462, 236]]};
    case "point":
      return {l: [[214, 565], [200, 665]], r: [[456, 480], [560, 468]]};
    case "hold":
      return {l: [[226, 590], [276, 556]], r: [[374, 590], [324, 556]]};
    case "shrug":
      return {l: [[176, 548], [118, 474]], r: [[424, 548], [482, 474]]};
    case "walk":
      return {l: [[218, 565], [212 - swing * 34, 662]], r: [[382, 565], [388 + swing * 34, 662]]};
    default:
      return {l: [[214, 565], [200, 665 + swing * 3]], r: [[386, 565], [400, 665 - swing * 3]]};
  }
};

const roundRect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

const filled = (g: CanvasRenderingContext2D, fill: string, width = 10) => {
  g.fillStyle = fill;
  g.fill();
  g.lineWidth = width;
  g.strokeStyle = INK;
  g.lineJoin = "round";
  g.stroke();
};

const drawHat = (p: Pen, look: Look, head: P2) => {
  const g = p.g;
  const [cx, cy] = head;
  switch (look.hat) {
    case "beanie":
      g.beginPath();
      g.moveTo(cx - 118, cy - 46);
      g.bezierCurveTo(cx - 134, cy - 250, cx + 134, cy - 250, cx + 118, cy - 46);
      g.closePath();
      filled(g, look.hatColor, 12);
      roundRect(g, cx - 126, cy - 92, 252, 46, 20);
      filled(g, look.trim, 12);
      break;
    case "cap":
      g.beginPath();
      g.moveTo(cx - 112, cy - 40);
      g.bezierCurveTo(cx - 122, cy - 210, cx + 122, cy - 210, cx + 112, cy - 40);
      g.closePath();
      filled(g, look.hatColor, 12);
      p.ell(cx, cy - 38, 134, 22, look.trim, 12);
      break;
    case "topi":
      g.beginPath();
      g.moveTo(cx - 92, cy - 62);
      g.bezierCurveTo(cx - 96, cy - 138, cx + 96, cy - 138, cx + 92, cy - 62);
      g.closePath();
      filled(g, look.hatColor, 12);
      roundRect(g, cx - 98, cy - 70, 196, 30, 14);
      filled(g, look.trim, 12);
      break;
    case "hair":
      g.beginPath();
      g.moveTo(cx - 112, cy - 20);
      g.bezierCurveTo(cx - 140, cy - 130, cx + 120, cy - 150, cx + 114, cy - 24);
      g.bezierCurveTo(cx + 70, cy - 80, cx - 50, cy - 84, cx - 112, cy - 20);
      g.closePath();
      filled(g, look.hatColor, 10);
      break;
    default:
      break;
  }
};

const drawFace = (p: Pen, mood: Mood, blink: boolean, extras: Extra[], head: P2) => {
  const g = p.g;
  const [cx, cy] = head;
  const ey = cy - 4;
  const exs = [cx - 44, cx + 44];
  const shut = blink || mood === "laugh" || mood === "relief" || mood === "grin";
  for (const ex of exs) {
    if (mood === "shock") {
      p.ell(ex, ey, 26, 30, WHITE, 8);
      p.dot(ex, ey + 2, 9);
    } else if (shut) {
      const arc = mood === "relief" || mood === "grin" || mood === "laugh";
      p.arc(ex, ey + (arc ? 8 : 0), 17, arc ? 15 : 4, arc ? 200 : 0, arc ? 340 : 180, 9);
    } else {
      p.ell(ex, ey, 10, 13, INK, 0);
    }
  }
  if (mood === "worry") {
    p.stroke([[exs[0] - 22, ey - 40], [exs[0] + 20, ey - 54]], 9);
    p.stroke([[exs[1] + 22, ey - 40], [exs[1] - 20, ey - 54]], 9);
  }
  if (mood === "shock") {
    p.stroke([[exs[0] - 24, ey - 54], [exs[0] + 20, ey - 62]], 9);
    p.stroke([[exs[1] + 24, ey - 54], [exs[1] - 20, ey - 62]], 9);
  }
  const my = cy + 52;
  switch (mood) {
    case "smile":
    case "relief":
      p.arc(cx, my - 14, 36, 26, 25, 155, 9);
      break;
    case "grin":
      g.beginPath();
      g.moveTo(cx - 44, my - 14);
      g.bezierCurveTo(cx - 40, my + 40, cx + 40, my + 40, cx + 44, my - 14);
      g.closePath();
      filled(g, "#8c2f3b", 8);
      break;
    case "laugh":
      p.ell(cx, my + 6, 46, 36, "#8c2f3b", 8, 0, 180);
      break;
    case "shock":
      p.ell(cx, my + 6, 17, 24, "#8c2f3b", 8);
      break;
    case "worry":
      p.stroke([[cx - 36, my + 4], [cx - 18, my - 6], [cx, my + 4], [cx + 18, my - 6], [cx + 36, my + 4]], 8);
      break;
    default:
      p.stroke([[cx - 26, my - 4], [cx + 26, my - 4]], 8);
  }
  if (mood === "worry" || mood === "shock") {
    g.beginPath();
    g.moveTo(cx + 112, cy - 78);
    g.quadraticCurveTo(cx + 140, cy - 34, cx + 112, cy - 24);
    g.quadraticCurveTo(cx + 84, cy - 34, cx + 112, cy - 78);
    filled(g, "#7fd3ff", 6);
  }
  if (extras.includes("moustache")) {
    p.ell(cx - 24, my - 26, 30, 11, INK, 0, 0, 360, -12);
    p.ell(cx + 24, my - 26, 30, 11, INK, 0, 0, 360, 12);
  }
  if (extras.includes("glasses")) {
    for (const ex of exs) p.ell(ex, ey, 34, 34, null, 8);
    p.stroke([[exs[0] + 34, ey], [exs[1] - 34, ey]], 8);
  }
  if (extras.includes("bindi")) p.dot(cx, cy - 56, 8, "#d4224a");
};

const drawHeld = (p: Pen, held: Held, hand: P2, pose: Pose) => {
  if (!held) return;
  const g = p.g;
  const [x, y] = hand;
  switch (held) {
    case "phone": {
      g.save();
      g.translate(x, y - 30);
      g.rotate(pose === "phone" ? -0.12 : 0);
      roundRect(g, -34, -62, 68, 116, 14);
      filled(g, "#23232b", 8);
      roundRect(g, -26, -52, 52, 90, 8);
      g.fillStyle = "#bfe8ff";
      g.fill();
      g.restore();
      break;
    }
    case "card":
      g.save();
      g.translate(x, y - 20);
      g.rotate(-0.2);
      roundRect(g, -52, -34, 104, 68, 10);
      filled(g, "#2f6bff", 8);
      g.fillStyle = INK;
      g.fillRect(-52, -16, 104, 16);
      g.restore();
      break;
    case "receipt":
      g.save();
      g.translate(x, y + 10);
      roundRect(g, -34, -10, 68, 150, 6);
      filled(g, WHITE, 7);
      g.strokeStyle = INK;
      g.lineWidth = 6;
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.moveTo(-20, 18 + i * 22);
        g.lineTo(20, 18 + i * 22);
        g.stroke();
      }
      g.restore();
      break;
    case "strip":
      g.save();
      g.translate(x, y - 24);
      g.rotate(-0.3);
      roundRect(g, -52, -30, 104, 60, 10);
      filled(g, "#d9dee3", 7);
      for (let i = 0; i < 4; i++) p.ell(-34 + i * 23, -9, 8, 11, ["#ff7ab6", "#ffffff", "#5fe3d4", "#ffd45e"][i], 4);
      for (let i = 0; i < 4; i++) p.ell(-34 + i * 23, 13, 8, 11, ["#ffd45e", "#5fe3d4", "#ffffff", "#ff7ab6"][i], 4);
      g.restore();
      break;
    case "cup":
      g.save();
      g.translate(x, y - 22);
      roundRect(g, -22, -32, 44, 60, 8);
      filled(g, "#f2c98f", 7);
      g.restore();
      break;
  }
};

/** Draw one figure on the card. */
export const drawFigure = (p: Pen, s: FigureSpec) => {
  const g = p.g;
  const {look} = s;
  const extras = look.extras ?? [];
  const walk = s.pose === "walk" ? Math.sin(s.phase * Math.PI * 2) : 0;
  const breath = s.pose === "walk" ? -Math.abs(Math.cos(s.phase * Math.PI * 2)) * 14 : Math.sin(s.phase * Math.PI * 2) * -4;
  const head: P2 = [HEAD[0], HEAD[1] + breath];

  // legs
  for (const side of [-1, 1]) {
    const lift = walk * side < 0 ? 22 : 0;
    const foot: P2 = [300 + side * 44 + walk * side * -46, FOOT_Y - lift];
    p.stroke([[300 + side * 26, HIP_Y + breath], [300 + side * 36 + walk * side * -20, 840], foot], LIMB);
    p.ell(foot[0] + side * 12, foot[1] - 2, 34, 17, look.trim, 8);
  }
  // spine + neck
  p.stroke([[300, head[1] + 110], [300, HIP_Y + breath]], LIMB);

  // coat (behind the vest sleeves) and vest
  if (extras.includes("coat")) {
    g.beginPath();
    g.moveTo(222, 452 + breath);
    g.lineTo(378, 452 + breath);
    g.lineTo(398, 860);
    g.lineTo(202, 860);
    g.closePath();
    filled(g, WHITE, 10);
    g.beginPath();
    g.moveTo(300, 452 + breath);
    g.lineTo(300, 860);
    g.strokeStyle = INK;
    g.lineWidth = 6;
    g.stroke();
  } else {
    g.beginPath();
    g.moveTo(230, 452 + breath);
    g.lineTo(370, 452 + breath);
    g.lineTo(388, HIP_Y + 10);
    g.lineTo(212, HIP_Y + 10);
    g.closePath();
    filled(g, look.vest, 10);
    g.beginPath();
    g.moveTo(300, 452 + breath);
    g.lineTo(300, HIP_Y + 10);
    g.strokeStyle = INK;
    g.lineWidth = 5;
    g.stroke();
    if (extras.includes("apron")) {
      roundRect(g, 238, 560 + breath, 124, 150, 16);
      filled(g, WHITE, 8);
    }
    if (extras.includes("tie")) {
      g.beginPath();
      g.moveTo(300, 462 + breath);
      g.lineTo(284, 520 + breath);
      g.lineTo(300, 600 + breath);
      g.lineTo(316, 520 + breath);
      g.closePath();
      filled(g, "#d4224a", 7);
    }
  }

  // arms and what they hold
  const arms = armsFor(s.pose, s.phase);
  for (const [shoulder, [elbow, hand]] of [[SHOULDER_L, arms.l], [SHOULDER_R, arms.r]] as const) {
    p.stroke([[shoulder[0], shoulder[1] + breath], elbow, hand], LIMB);
    p.ell(hand[0], hand[1], 15, 15, INK, 0);
  }
  if (s.held) drawHeld(p, s.held, s.pose === "hold" ? [300, 556] : arms.r[1], s.pose);

  // head, hat, face
  p.ell(head[0], head[1], 124, 116, look.head, 12);
  drawHat(p, look, head);
  drawFace(p, s.mood, s.blink, extras, head);
};

/** Stable cache key for a drawing (everything that changes the pixels). */
export const figureKey = (name: string, s: FigureSpec) =>
  `fig|${name}|${s.mood}|${s.pose}|${s.held ?? "-"}|${Math.round(s.phase * 24)}|${s.blink ? 1 : 0}`;
