import { MouseEvent } from "react";
import { PencilLine } from 'lucide-react'

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
}
