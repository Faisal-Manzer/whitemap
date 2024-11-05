import { MouseEvent } from "react";
import { PencilLine } from "lucide-react";

import { EventModifier, Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import {
  BondedRectangle,
  Point,
  ShapeConfiguration,
  ShapePanelConfiguration,
} from "../types";

export class Pen extends Shape {
  static name: string = "Pen";
  static icon = PencilLine;
  static cursor: string = "crosshair";
  static panel: ShapePanelConfiguration = { ...Shape.panel, background: false };

  constructor(config: ShapeConfiguration) {
    super(config);
  }

  static onMouseMove({ e, shape }: EventModifier): void {
    if (!shape.current) return;

    if (e.shiftKey) {
      const point = $xy(e);
      if (shape.current.points.length) {
        const start = shape.current.points[0];

        if (Math.abs(start.x - point.x) > Math.abs(start.y - point.y)) {
          shape.current.points = [start, { x: point.x, y: start.y }];
        } else {
          shape.current.points = [start, { x: start.x, y: point.y }];
        }
      } else shape.current.points.push(point);
    } else {
      shape.current.points.push($xy(e));
    }
  }

  boundedRectangle(): BondedRectangle | null {
    if (this.points.length < 2) return null;

    const topLeft = {
      x: Math.min(...this.points.map((p) => p.x)),
      y: Math.min(...this.points.map((p) => p.y)),
    };
    const bottomRight = {
      x: Math.max(...this.points.map((p) => p.x)),
      y: Math.max(...this.points.map((p) => p.y)),
    };
    return { topLeft, bottomRight };
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): typeof this {
    const points = this.points;

    this.configure(ctx);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === points.length - 1) {
        ctx.lineTo(point.x, point.y);
        break;
      }

      const pointNext = points[i + 1];
      const midX = (point.x + pointNext.x) / 2;
      const midY = (point.y + pointNext.y) / 2;

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(midX, midY);
      } else {
        ctx.quadraticCurveTo(point.x, point.y, midX, midY);
      }
    }

    ctx.stroke();
    return this;
  }

  translate(delta: Point): typeof this {
    this.points = this.points.map((p) => ({
      x: p.x + delta.x,
      y: p.y + delta.y,
    }));

    return this;
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>): boolean {
    const path = this.points;
    const threshold = this.config.borderWidth + 5; // distance threshold

    for (let i = 0; i < path.length - 1; i++) {
      const { x: x1, y: y1 } = path[i];
      const { x: x2, y: y2 } = path[i + 1];
      const { clientX: px, clientY: py } = e;

      // Calculate the shortest distance from the point to the line segment
      const dx = x2 - x1;
      const dy = y2 - y1;
      const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
      const tt = Math.max(0, Math.min(1, t));
      const lx = x1 + tt * dx;
      const ly = y1 + tt * dy;
      const dist = Math.sqrt((px - lx) * (px - lx) + (py - ly) * (py - ly));

      if (dist < threshold) {
        return true;
      }
    }

    return false;
  }

  isEmpty(): boolean {
    return this.points.length === 0;
  }
}
