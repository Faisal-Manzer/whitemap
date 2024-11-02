import { MouseEvent } from "react";

export const $xy = (e: MouseEvent<HTMLCanvasElement>) => ({
  x: e.clientX,
  y: e.clientY,
});
