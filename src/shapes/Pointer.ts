import { MousePointer2 } from "lucide-react";

import { Rectangle } from "./Rectangle";
import { ShapeConfiguration, ShapePanelConfiguration } from "../types";

export class Pointer extends Rectangle {
  drawingOnly = true;

  static name: string = "Pointer";
  static icon = MousePointer2;
  static cursor: string = "cursor";
  static panel: ShapePanelConfiguration = { noPanel: true };

  constructor(config: ShapeConfiguration) {
    super(config);

    this.config.borderWidth = 0.5;
    this.config.border = "#7c3aed";
    this.config.background = "rgba(221, 214, 254, 0.5)";
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): typeof this {
    if (!this.start || !this.end) return this;

    ctx.setLineDash([15, 5]);
    super.draw(ctx);

    ctx.setLineDash([]);
    return this;
  }
}
