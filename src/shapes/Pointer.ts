import { MouseEvent } from "react";
import { MousePointer2 } from 'lucide-react'

import { Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { Point, ShapeConfiguration, ShapePanelConfiguration } from "../types";

export class Pointer extends Shape {
  drawingOnly = true;

  static name: string = "Pointer";
  static icon = MousePointer2;
  static pointer: string = "cursor";
  static panel: ShapePanelConfiguration = { ...Shape.panel, noPanel: true };

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

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#3b82f6";
    ctx.fillStyle = "#3b82f622"

    ctx.rect(
      this.start.x,
      this.start.y,
      this.end.x - this.start.x,
      this.end.y - this.start.y,
    );
    ctx.stroke();
  }
}
