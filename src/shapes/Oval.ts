import { MouseEvent } from "react";
import { Circle } from 'lucide-react'

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
}
