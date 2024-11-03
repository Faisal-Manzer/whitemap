import { MouseEvent } from "react";
import { Square } from "lucide-react";

import { Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { BondedRectangle, Point, ShapeConfiguration } from "../types";

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

  boundedRectangle(): BondedRectangle | null {
    if (!this.start || !this.end) return null;

    console.log("[Shape:boundedRectangle] Not Implemented");
    return {
      topLeft: this.start,
      bottomRight: this.end,
      // topRight: { x: this.start.x, y: this.end.y },
      // bottomLeft: { x: this.end.x, y: this.start.y },
    };
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
    if (!this.start || !this.end) return;

    this.configure(ctx);
    ctx.rect(
      this.start.x,
      this.start.y,
      this.end.x - this.start.x,
      this.end.y - this.start.y,
    );

    ctx.fill();
    ctx.stroke();
  }

  translate(dX: number, dY: number): void {
    if (this.start) {
      this.start.x += dX;
      this.start.y += dY;
    }

    if (this.end) {
      this.end.x += dX;
      this.end.y += dY;
    }
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>) {
    if (!this.start || !this.end) return false;
    return this.start.x <= e.clientX && e.clientX <= this.end.x &&
      this.start.y <= e.clientY && e.clientY <= this.end.y;
  }
}
