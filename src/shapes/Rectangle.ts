import { MouseEvent, MutableRefObject } from "react";
import { Square } from "lucide-react";

import { EventModifier, Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { BondedRectangle, Point, ShapeConfiguration } from "../types";

export class Rectangle extends Shape {
  static name: string = "Rectangle";
  static icon = Square;
  static pointer: string = "crosshair";

  constructor(config: ShapeConfiguration) {
    super(config);

    this.start = null;
    this.end = null;
  }

  static onMouseMove({ e, shape }: EventModifier): void {
    if (!shape.current) return;

    if (shape.current.start === null) {
      shape.current.start = $xy(e);
    } else if (e.shiftKey) {
      // TODO: Implement shift behavior
      shape.current.end = $xy(e);
    } else {
      shape.current.end = $xy(e);
    }
  }

  boundedRectangle(): BondedRectangle | null {
    if (!this.start || !this.end) return null;

    if (this.start.x > this.end.x && this.start.y > this.end.y ) return {
      topLeft: this.end,
      bottomRight: this.start,
    }
    
    return {
      topLeft: this.start,
      bottomRight: this.end,
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

  translate(delta: Point): void {
    if (this.start) {
      this.start.x += delta.x;
      this.start.y += delta.y;
    }

    if (this.end) {
      this.end.x += delta.x;
      this.end.y += delta.y;
    }
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>) {
    if (!this.start || !this.end) return false;
    return (this.start.x <= e.clientX && e.clientX <= this.end.x &&
      this.start.y <= e.clientY && e.clientY <= this.end.y) || (
        this.end.x <= e.clientX && e.clientX <= this.start.x &&
      this.end.y <= e.clientY && e.clientY <= this.start.y
      );
  }

  isEmpty() {
    return !this.start || !this.end;
  }
}
