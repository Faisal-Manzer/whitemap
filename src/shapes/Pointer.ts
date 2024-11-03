import { MousePointer2 } from "lucide-react";

import { Shape } from "./Shape";
import { Rectangle } from "./Rectangle";
import { ShapeConfiguration, ShapePanelConfiguration } from "../types";

export class Pointer extends Rectangle {
  drawingOnly = true;

  static name: string = "Pointer";
  static icon = MousePointer2;
  static pointer: string = "cursor";
  static panel: ShapePanelConfiguration = { ...Shape.panel, noPanel: true };

  constructor(config: ShapeConfiguration) {
    super(config);

    this.config.borderWidth = 0.5;
    this.config.border = "#7c3aed";
    this.config.background = "rgba(221, 214, 254, 0.5)";
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
    if (!this.start || !this.end) return;

    ctx.setLineDash([15, 5]);
    super.draw(ctx);
  }
}
