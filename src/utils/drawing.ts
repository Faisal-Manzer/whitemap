import { RefObject } from "react";
import { BondedRectangle } from "../types";

export const setup = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ratio = Math.ceil(globalThis.devicePixelRatio);
  canvas.width = globalThis.innerWidth * ratio;
  canvas.height = globalThis.innerHeight * ratio;
  canvas.style.width = `${globalThis.innerWidth}px`;
  canvas.style.height = `${globalThis.innerHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(ratio, ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
};

export const draw = (
  canvasRef: RefObject<HTMLCanvasElement>,
  paint: (ctx: OffscreenCanvasRenderingContext2D) => void,
) => {
  const canvas = canvasRef.current;
  const canvasCtx = canvas?.getContext("2d");
  if (!canvas || !canvasCtx) return;

  const offScreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
  const offScreenCanvasCtx = offScreenCanvas.getContext("2d");

  if (!offScreenCanvasCtx) return;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  paint(offScreenCanvasCtx);
  canvasCtx.drawImage(offScreenCanvas, 0, 0);
};

export const drawBoundingBox = (
  ctx: OffscreenCanvasRenderingContext2D,
  rect: BondedRectangle | null,
) => {
  if (!rect) return;

  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.strokeStyle = "#4c1d95";
  ctx.lineWidth = 1;

  ctx.rect(
    rect.topLeft.x - 10,
    rect.topLeft.y - 10,
    rect.bottomRight.x - rect.topLeft.x + 20,
    rect.bottomRight.y - rect.topLeft.y + 20,
  );

  ctx.stroke();
  ctx.setLineDash([]);
};
