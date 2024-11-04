import { MouseEvent, MutableRefObject } from "react";
import { Shapes } from "lucide-react";

import { $ID } from "../utils/helpers";
import {
  BondedRectangle,
  Point,
  ShapeConfiguration,
  ShapePanelConfiguration,
} from "../types";

export interface EventModifier {
  e: MouseEvent<HTMLCanvasElement>;
  shape: MutableRefObject<Shape | null>;
  config: ShapeConfiguration;
  attach: () => void;
}

export class Shape {
  id: string;
  isSelected = false;
  isAttached = false;
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

  start: Point | null;
  end: Point | null;
  points: Point[];

  constructor(config: ShapeConfiguration) {
    this.id = $ID();
    this.config = config;

    this.start = null;
    this.end = null;
    this.points = [];
  }

  static onMouseDown({ shape, config }: EventModifier): void {
    if (!shape.current) {
      shape.current = new this(config);
    }
  }

  static onMouseMove( { e, shape }: EventModifier): void {
    console.log("[Shape:onMouseMove] Not Implemented", e, shape);
  }

  static onMouseUp({ attach }: EventModifier): void {
    attach();
  }

  boundedRectangle(): BondedRectangle | null {
    console.log("[Shape:boundedRectangle] Not Implemented");
    return null;
  }

  draw(ctx: OffscreenCanvasRenderingContext2D) {
    console.log("[Shape:draw] Not Implemented", ctx);
  }

  translate(delta: Point) {
    console.log("[Shape:translate] Not Implemented", delta);
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

  isEmpty() {
    return true;
  }
}
