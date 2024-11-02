import { MouseEvent } from "react";

import { Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { Point } from "../types";

export class Oval extends Shape {
  static name: string = "Oval";
  static pointer: string = "crosshair";

  start: Point | null;
  end: Point | null;

  constructor() {
    super();

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

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0000ff";

    ctx.ellipse(
      (this.end.x + this.start.x) / 2,
      (this.end.y + this.start.y) / 2,
      Math.abs(this.end.x - this.start.x) / 2,
      Math.abs(this.end.y - this.start.y) / 2,
      0,
      0,
      2 * Math.PI,
    );
    ctx.stroke();
  }
}
