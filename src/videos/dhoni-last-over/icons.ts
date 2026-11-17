// Icons of "The Last Over": a football, bat, ball, trophy, ticket, confetti and the five-dot story bar.
// All drawn with the shared Pen, no logos and no real likeness.
import type {Icon} from "../../toon3d/icons";
import {INK} from "../../toon3d/toon";

export const footballIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    p.ell(128, 128, 100, 100, "#fffaf2", 11);
    p.poly([[128, 78], [166, 106], [152, 150], [104, 150], [90, 106]], INK, 6);
    p.stroke([[128, 78], [128, 30]], 8);
    p.stroke([[166, 106], [212, 92]], 8);
    p.stroke([[152, 150], [180, 196]], 8);
    p.stroke([[104, 150], [76, 196]], 8);
    p.stroke([[90, 106], [44, 92]], 8);
  },
};

/** a cricket bat leaning to the right: blade, handle with a grip */
export const batIcon: Icon = {
  cw: 256, ch: 256,
  draw: (p) => {
    p.g.save();
    p.g.translate(128, 128);
    p.g.rotate(0.5);
    p.g.translate(-128, -128);
    p.poly([[100, 120], [156, 120], [162, 232], [94, 232]], "#e7c58b", 11);
    p.stroke([[128, 134], [128, 214]], 7, "#c9a15e");
    p.poly([[118, 30], [138, 30], [140, 120], [116, 120]], "#f2e6cf", 9);
    p.poly([[116, 52], [140, 52], [140, 92], [116, 92]], "#2f6bff", 6);
    p.g.restore();
  },
};

export const cricketBallIcon: Icon = {
  cw: 192, ch: 192,
  draw: (p) => {
    p.ell(96, 96, 74, 74, "#d7263d", 10);
    p.arc(96, 96, 56, 74, -60, 60, 6, "#fffaf2");
    p.arc(96, 96, 56, 74, 120, 240, 6, "#fffaf2");
  },
};

/** a gold cup on a base; `base` colours the plinth */
export const trophyIcon = (base = "#2f6bff"): Icon => ({
  cw: 256, ch: 320,
  draw: (p) => {
    p.poly([[56, 70], [200, 70], [182, 150], [150, 190], [106, 190], [74, 150]], "#ffc93c", 11);
    p.arc(54, 104, 30, 34, 90, 270, 10);
    p.arc(202, 104, 30, 34, -90, 90, 10);
    p.poly([[116, 190], [140, 190], [146, 244], [110, 244]], "#f2a900", 9);
    p.poly([[76, 244], [180, 244], [188, 296], [68, 296]], base, 11);
    p.stroke([[84, 94], [100, 150]], 9, "#fff2b8");
  },
});

export const ticketIcon: Icon = {
  cw: 320, ch: 200,
  draw: (p) => {
    p.poly([[20, 30], [300, 30], [300, 78], [284, 100], [300, 122], [300, 170], [20, 170], [20, 122], [36, 100], [20, 78]], "#fff4de", 10);
    p.stroke([[210, 40], [210, 160]], 6);
    p.stroke([[50, 74], [180, 74]], 10);
    p.stroke([[50, 108], [150, 108]], 10);
    p.stroke([[50, 140], [120, 140]], 10);
    p.ell(250, 100, 20, 20, "#ffc93c", 6);
  },
};

/** one scrap of confetti */
export const confettiIcon = (color: string): Icon => ({
  cw: 64, ch: 64,
  draw: (p) => p.poly([[10, 20], [54, 8], [48, 44], [6, 54]], color, 6),
});

/** the story bar: five dots (Ranchi, the train job, 2007, 2011, 2026), `n` of them filled gold */
export const storyDots = (n: number): Icon => ({
  cw: 640, ch: 110,
  draw: (p) => {
    const g = p.g;
    g.beginPath();
    g.roundRect(8, 8, 624, 94, 47);
    g.fillStyle = "rgba(23,18,74,0.72)";
    g.fill();
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 110;
      p.ell(x, 55, 22, 22, i < n ? "#ffc93c" : "#fffaf2", i < n ? 7 : 5);
      if (i < 4) p.stroke([[x + 28, 55], [x + 82, 55]], 6, i + 1 < n ? "#ffc93c" : "#8a86b8");
    }
  },
});
