import { MouseEvent } from "react";
import { MousePointer2 } from "lucide-react";

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

    this.config.borderWidth = 0.5;
    this.config.border = "#7c3aed";
    this.config.background = "rgba(221, 214, 254, 0.5)";
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
    ctx.setLineDash([15, 5]);
    ctx.rect(
      this.start.x,
      this.start.y,
      this.end.x - this.start.x,
      this.end.y - this.start.y,
    );

    ctx.fill();
    ctx.stroke();
  }
}
