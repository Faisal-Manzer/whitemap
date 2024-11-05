import { MouseEvent } from "react";
import { Square } from "lucide-react";

import { EventModifier, Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import {
  BondedRectangle,
  Point,
  ShapeConfiguration,
  ShapePanelConfiguration,
} from "../types";
import { isInsideBoundedRect } from "../utils/mouse";

export class Rectangle extends Shape {
  static name: string = "Rectangle";
  static icon = Square;
  static cursor: string = "crosshair";
  static panel: ShapePanelConfiguration = {
    ...Shape.panel,
    edge: true,
  };

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
      const point = $xy(e);

      const height = Math.abs(point.y - shape.current.start.y);
      const width = Math.abs(point.x - shape.current.start.x);

      const multiplierX = point.x > shape.current.start.x ? 1 : -1;
      const multiplierY = point.y > shape.current.start.y ? 1 : -1;

      const l = Math.max(height, width);
      const newPoint = {
        x: shape.current.start.x + l * multiplierX,
        y: shape.current.start.y + l * multiplierY,
      };

      shape.current.end = newPoint;
    } else {
      shape.current.end = $xy(e);
    }
  }

  boundedRectangle(): BondedRectangle | null {
    if (!this.start || !this.end) return null;

    return {
      topLeft: {
        x: Math.min(this.start.x, this.end.x),
        y: Math.min(this.start.y, this.end.y),
      },
      bottomRight: {
        x: Math.max(this.start.x, this.end.x),
        y: Math.max(this.start.y, this.end.y),
      },
    };
  }

  draw(ctx: OffscreenCanvasRenderingContext2D) {
    if (!this.start || !this.end) return this;

    this.configure(ctx);
    ctx.roundRect(
      this.start.x,
      this.start.y,
      this.end.x - this.start.x,
      this.end.y - this.start.y,
      this.config.edge === "rounded" ? 10 : 0,
    );

    ctx.fill();
    ctx.stroke();

    return this;
  }

  translate(delta: Point) {
    if (this.start) {
      this.start.x += delta.x;
      this.start.y += delta.y;
    }

    if (this.end) {
      this.end.x += delta.x;
      this.end.y += delta.y;
    }

    return this;
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>) {
    return isInsideBoundedRect(
      e,
      this.boundedRectangle(),
    );
  }

  isEmpty() {
    return !this.start || !this.end;
  }
}
