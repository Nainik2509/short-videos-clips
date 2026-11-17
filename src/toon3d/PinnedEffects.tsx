// Labels and badges pinned to the picture, drawn as a crisp 2D layer over the 3D frame (so the world's ink and
// depth blur never touch them). They reuse the same icon drawings as the 3D effect cards.
import React, {useLayoutEffect, useRef} from "react";
import {Pen} from "./toon";
import type {Icon} from "./icons";
import {HEIGHT, WIDTH} from "../lib/theme";
import {isPinned, popScale, type Effect} from "./reel";

const IconCanvas: React.FC<{icon: Icon; width: number}> = ({icon, width}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current?.getContext("2d");
    if (g) icon.draw(new Pen(g));
  }, [icon]);
  return <canvas ref={ref} width={icon.cw} height={icon.ch} style={{width, height: (width * icon.ch) / icon.cw, display: "block"}} />;
};

/** `t` = seconds into the current shot */
export const PinnedEffects: React.FC<{effects: Effect[]; t: number}> = ({effects, t}) => (
  <>
    {effects.filter(isPinned).map((e) => {
      const s = popScale(t, e.at ?? 0);
      if (s <= 0.01) return null;
      const width = e.screen.span * WIDTH;
      return (
        <div
          key={e.id}
          style={{
            position: "absolute",
            left: ((1 + e.screen.x) / 2) * WIDTH,
            top: ((1 - e.screen.y) / 2) * HEIGHT,
            transform: `translate(-50%, -50%) scale(${s})`,
            pointerEvents: "none",
          }}
        >
          <IconCanvas icon={e.icon} width={width} />
        </div>
      );
    })}
  </>
);
