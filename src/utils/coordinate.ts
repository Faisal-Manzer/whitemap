import { MouseEvent } from "react";

export const $xy = (e: MouseEvent<HTMLCanvasElement>) => ({
  x: e.clientX,
  y: e.clientY,
});

export const $box = (canvas: HTMLCanvasElement, e: MouseEvent<HTMLCanvasElement>) => {
  const rect = canvas.getBoundingClientRect();
  return {
    ...e,
    clientX: e.clientX - rect.left,
    clientY: e.clientY - rect.top,
  };
};
