// Effect-card drawings: small icons and labels that pop in beside the action (tick, cross, coin, signal bars,
// price tag, receipt). Each returns a draw function for `FxPlace.draw` plus the canvas size it needs.
import {INK, Pen} from "./toon";

export type Icon = {cw: number; ch: number; draw: (p: Pen) => void};

const FONT = '"Helvetica Neue", Inter, Arial, sans-serif';

/** fits `text` in `max` px wide by lowering the font size */
const fitText = (g: CanvasRenderingContext2D, text: string, size: number, max: number) => {
  g.font = `800 ${size}px ${FONT}`;
  const w = g.measureText(text).width;
  const fitted = w > max ? Math.floor((size * max) / w) : size;
  g.font = `800 ${fitted}px ${FONT}`;
  return fitted;
};

export const tickIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    const g = p.g;
    p.ell(128, 128, 96, 96, "#3ddc84", 12);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = INK;
    g.lineWidth = 22;
    g.beginPath();
    g.moveTo(84, 130);
    g.lineTo(116, 164);
    g.lineTo(176, 94);
    g.stroke();
    g.strokeStyle = "#ffffff";
    g.lineWidth = 11;
    g.stroke();
  },
};

export const coinIcon = (symbol: string): Icon => ({
  cw: 192, ch: 192,
  draw: (p) => {
    const g = p.g;
    p.ell(96, 96, 78, 78, "#ffd45e", 10);
    p.ell(96, 96, 56, 56, null, 5);
    g.fillStyle = INK;
    g.textAlign = "center";
    fitText(g, symbol, 84, 90);
    g.fillText(symbol, 96, 124);
  },
});

/** signal bars (n of 4 filled) */
export const signalIcon = (n: number): Icon => ({
  cw: 256, ch: 256,
  draw: (p) => {
    for (let i = 0; i < 4; i++) {
      const h = 50 + i * 42;
      p.poly(
        [[40 + i * 48, 220], [40 + i * 48, 220 - h], [76 + i * 48, 220 - h], [76 + i * 48, 220]],
        i < n ? "#3ddc84" : "#d9dee3",
        9,
      );
    }
  },
});

/** a pill-shaped label: price tags, numbers, short words */
export const labelIcon = (text: string, bg = "#ffc93c", fg = INK, cw = 640): Icon => ({
  cw, ch: 220,
  draw: (p) => {
    const g = p.g;
    g.beginPath();
    g.roundRect(14, 14, cw - 28, 192, 92);
    g.fillStyle = bg;
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = fg;
    g.textAlign = "center";
    const size = fitText(g, text, 120, cw - 90);
    g.fillText(text, cw / 2, 110 + size * 0.34);
  },
});

/** a long receipt with a total line */
export const receiptIcon = (lines: string[], total: string): Icon => ({
  cw: 360, ch: 640,
  draw: (p) => {
    const g = p.g;
    g.beginPath();
    g.roundRect(24, 20, 312, 600, 14);
    g.fillStyle = "#fffaf2";
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = INK;
    g.textAlign = "left";
    lines.forEach((line, i) => {
      fitText(g, line, 46, 260);
      g.fillText(line, 54, 100 + i * 80);
    });
    g.textAlign = "center";
    g.fillStyle = "#d4224a";
    fitText(g, total, 76, 270);
    g.fillText(total, 180, 560);
  },
});

/** a red "Rx" tag */
export const rxIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    const g = p.g;
    g.beginPath();
    g.roundRect(20, 40, 216, 176, 40);
    g.fillStyle = "#e8344a";
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = "#ffffff";
    g.textAlign = "center";
    g.font = `800 120px ${FONT}`;
    g.fillText("Rx", 128, 164);
  },
};

/** a black-and-white cow, side on (facing screen left) */
export const cowIcon: Icon = {
  cw: 520, ch: 400,
  draw: (p) => {
    for (const x of [170, 220, 350, 400]) p.poly([[x - 16, 250], [x + 16, 250], [x + 14, 372], [x - 14, 372]], "#fffaf2", 9);
    for (const x of [170, 220, 350, 400]) p.poly([[x - 16, 356], [x + 16, 356], [x + 16, 380], [x - 16, 380]], INK, 0);
    p.ell(330, 268, 30, 22, "#ff9db5", 8);
    p.ell(285, 190, 150, 86, "#fffaf2", 11);
    p.clip([[135, 104], [435, 104], [435, 276], [135, 276]], () => {
      p.ell(250, 150, 52, 40, INK, 0);
      p.ell(370, 220, 46, 38, INK, 0);
      p.ell(180, 236, 30, 24, INK, 0);
    });
    p.stroke([[432, 160], [470, 200], [462, 262]], 9);
    p.ell(462, 270, 9, 14, INK, 0);
    p.stroke([[70, 96], [52, 66]], 12, "#f1e0b8");
    p.stroke([[138, 92], [152, 62]], 12, "#f1e0b8");
    p.ell(46, 128, 26, 14, "#fffaf2", 8, 0, 360, -20);
    p.ell(160, 122, 26, 14, "#fffaf2", 8, 0, 360, 20);
    p.ell(104, 150, 62, 60, "#fffaf2", 11);
    p.ell(104, 186, 44, 28, "#ffc2cf", 9);
    p.dot(90, 186, 6);
    p.dot(118, 186, 6);
    p.dot(82, 138, 9);
    p.dot(126, 138, 9);
  },
};

/** a sealed letter */
export const envelopeIcon: Icon = {
  cw: 256, ch: 192,
  draw: (p) => {
    p.poly([[18, 26], [238, 26], [238, 166], [18, 166]], "#fffaf2", 11);
    p.stroke([[18, 26], [128, 110], [238, 26]], 9);
    p.poly([[176, 40], [222, 40], [222, 84], [176, 84]], "#e8344a", 6);
  },
};

/** a film clapperboard */
export const clapperIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    p.poly([[30, 104], [226, 104], [226, 226], [30, 226]], "#2b2b33", 11);
    p.rot = [-0.2, 30, 100];
    p.poly([[30, 56], [226, 56], [226, 100], [30, 100]], "#fffaf2", 11);
    for (let i = 0; i < 4; i++) p.poly([[44 + i * 50, 56], [70 + i * 50, 56], [52 + i * 50, 100], [26 + i * 50, 100]], "#2b2b33", 0);
    p.rot = null;
    p.stroke([[52, 150], [204, 150]], 8, "#fffaf2");
    p.stroke([[52, 190], [150, 190]], 8, "#fffaf2");
  },
};

/** a red chilli */
export const chiliIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    p.poly([[70, 72], [112, 60], [150, 96], [190, 150], [214, 222], [150, 190], [96, 138]], "#e8344a", 11);
    p.stroke([[84, 70], [62, 34]], 14, "#1fa35a");
    p.stroke([[112, 96], [150, 140]], 7, "#ff9aa5");
  },
};

/** a milk can */
export const milkCanIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    p.poly([[66, 110], [190, 110], [200, 232], [56, 232]], "#dfe6ec", 11);
    p.poly([[92, 62], [164, 62], [190, 110], [66, 110]], "#c3ccd5", 11);
    p.poly([[84, 34], [172, 34], [172, 62], [84, 62]], "#dfe6ec", 11);
    p.stroke([[86, 150], [86, 204]], 9, "#ffffff");
  },
};

/** a stacked tower block */
export const towerIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    const tiers: [number, number][] = [[78, 104], [60, 96], [84, 112], [66, 100], [74, 124]];
    tiers.forEach(([x, w], i) => {
      p.poly([[x, 26 + i * 42], [x + w, 26 + i * 42], [x + w, 62 + i * 42], [x, 62 + i * 42]], i % 2 ? "#9ad8ff" : "#ffc93c", 9);
    });
    p.stroke([[30, 240], [226, 240]], 10);
  },
};

/** any icon on a white disc, so it reads over a busy background */
export const onDisc = (icon: Icon): Icon => ({
  cw: 320, ch: 320,
  draw: (p) => {
    p.ell(160, 160, 146, 146, "#fffaf2", 12);
    const k = 200 / Math.max(icon.cw, icon.ch);
    p.g.save();
    p.g.translate(160 - (icon.cw * k) / 2, 160 - (icon.ch * k) / 2);
    p.g.scale(k, k);
    icon.draw(p);
    p.g.restore();
  },
});

