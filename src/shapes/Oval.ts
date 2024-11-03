import { MouseEvent } from "react";
import { Circle } from "lucide-react";

import { Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { Point, ShapeConfiguration } from "../types";

export class Oval extends Shape {
  static name: string = "Oval";
  static icon = Circle;
  static pointer: string = "crosshair";

  start: Point | null;
  end: Point | null;

  constructor(config: ShapeConfiguration) {
    super(config);

    this.start = null;
    this.end = null;
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    if (this.start === null) {
      this.start = $xy(e);
    } else {
      this.end = $xy(e);
    }
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
    if (!this.start || !this.end) return;

    this.configure(ctx);
    ctx.ellipse(
      (this.end.x + this.start.x) / 2,
      (this.end.y + this.start.y) / 2,
      Math.abs(this.end.x - this.start.x) / 2,
      Math.abs(this.end.y - this.start.y) / 2,
      0,
      0,
      2 * Math.PI,
    );

    ctx.fill();
    ctx.stroke();
  }

  translate(dX: number, dY: number): void {
    if (this.start) {
      this.start.x += dX;
      this.start.y += dY
    }

    if (this.end) {
      this.end.x += dX;
      this.end.y += dY;
    }
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>): boolean {
    if (!this.start || !this.end) return false;

    const xCenter = (this.start.x + this.end.x) / 2;
    const yCenter = (this.start.y + this.end.y) / 2;
    const radiusX = Math.abs(this.start.x - this.end.x) / 2;
    const radiusY = Math.abs(this.start.y - this.end.y) / 2;

    const dx = e.clientX - xCenter;
    const dy = e.clientY - yCenter;
    const distance = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);

    return distance <= 1;
  }
}
