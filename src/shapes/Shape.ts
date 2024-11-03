import { MouseEvent } from "react";
import { Shapes } from 'lucide-react'

import { $ID } from "../utils/helpers";

export class Shape {
  id: string;
  isSelected = false;
  static name: string = "Shape";
  static icon = Shapes;
  static cursor: string = "default";
  drawingOnly = false;

  constructor() {
    this.id = $ID();
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    console.log("[Shape:move] Not Implemented", e);
    throw new Error("[Shape:move] Not Implemented");
  }

  draw(ctx: OffscreenCanvasRenderingContext2D) {
    console.log("[Shape:draw] Not Implemented", ctx);
    throw new Error("[Shape:draw] Not Implemented");
  }

  get isHovered() {
    return false;
  }
}
