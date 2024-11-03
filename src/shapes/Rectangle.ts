import { MouseEvent } from "react";
import { Square } from 'lucide-react'

import { Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { Point, ShapeConfiguration } from "../types";

export class Rectangle extends Shape {
  static name: string = "Rectangle";
  static icon = Square;
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
    ctx.rect(
      this.start.x,
      this.start.y,
      this.end.x - this.start.x,
      this.end.y - this.start.y
    );
    
    ctx.fill();
    ctx.stroke();
  }
}
