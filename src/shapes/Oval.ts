import { MouseEvent } from "react";
import { Circle } from "lucide-react";

import { Rectangle } from "./Rectangle";

import { ShapeConfiguration, ShapePanelConfiguration } from "../types";

export class Oval extends Rectangle {
  static name: string = "Oval";
  static icon = Circle;
  static cursor: string = "crosshair";
  static panel: ShapePanelConfiguration = {
    ...Rectangle.panel,
    edge: false,
  };

  constructor(config: ShapeConfiguration) {
    super(config);
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): this {
    if (!this.start || !this.end) return this;

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

    return this;
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>): boolean {
    if (!this.start || !this.end) return false;

    const xCenter = (this.start.x + this.end.x) / 2;
    const yCenter = (this.start.y + this.end.y) / 2;
    const radiusX = Math.abs(this.start.x - this.end.x) / 2;
    const radiusY = Math.abs(this.start.y - this.end.y) / 2;

    const dx = e.clientX - xCenter;
    const dy = e.clientY - yCenter;
    const distance = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);

    return distance <= 1;
  }
}
