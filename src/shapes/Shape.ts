import { MouseEvent } from "react";
import { Shapes } from "lucide-react";

import { $ID } from "../utils/helpers";
import {
  BondedRectangle,
  ShapeConfiguration,
  ShapePanelConfiguration,
} from "../types";

export class Shape {
  id: string;
  drawingOnly = false;
  config: ShapeConfiguration;

  static name: string = "Shape";
  static icon = Shapes;
  static cursor: string = "default";
  static panel: ShapePanelConfiguration = {
    noPanel: false,
    background: true,
    border: true,
    borderWidth: 3,
  };

  constructor(config: ShapeConfiguration) {
    this.id = $ID();
    this.config = config;
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    console.log("[Shape:move] Not Implemented", e);
    throw new Error("[Shape:move] Not Implemented");
  }

  boundedRectangle(): BondedRectangle | null {
    console.log("[Shape:boundedRectangle] Not Implemented");
    return null;
  }

  draw(ctx: OffscreenCanvasRenderingContext2D) {
    console.log("[Shape:draw] Not Implemented", ctx);
    throw new Error("[Shape:draw] Not Implemented");
  }

  translate(dX: number, dY: number) {
    console.log("[Shape:translate] Not Implemented", `${dX},${dY}`);
  }

  configure(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.beginPath();

    ctx.lineCap = "round";
    ctx.strokeStyle = this.config.border;
    ctx.fillStyle = this.config.background;
    ctx.lineWidth = this.config.borderWidth;
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>) {
    console.log("[Shape:isHovered] Not Implemented", e);
    return false;
  }
}
