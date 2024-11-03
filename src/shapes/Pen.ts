import { MouseEvent } from "react";
import { PencilLine } from "lucide-react";

import { Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { Point, ShapeConfiguration, ShapePanelConfiguration } from "../types";

export class Pen extends Shape {
  static name: string = "Pen";
  static icon = PencilLine;
  static pointer: string = "crosshair";
  static panel: ShapePanelConfiguration = { ...Shape.panel, background: false };

  points: Point[];

  constructor(config: ShapeConfiguration) {
    super(config);
    this.points = [];
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    this.points.push($xy(e));
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
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
  }

  translate(dX: number, dY: number): void {
    this.points = this.points.map((p) => ({ x: p.x + dX, y: p.y + dY }));
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
}
