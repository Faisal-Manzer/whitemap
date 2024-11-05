import { MouseEvent, MutableRefObject } from "react";
import { Shapes } from "lucide-react";

import { $ID } from "../utils/helpers";
import {
  BondedRectangle,
  Point,
  ShapeConfiguration,
  ShapePanelConfiguration,
} from "../types";

export interface EventModifier<T = Shape> {
  canvas: HTMLCanvasElement,
  e: MouseEvent<HTMLCanvasElement>;
  shape: MutableRefObject<T | null>;
  config: ShapeConfiguration;
  attach: () => void;
  attachShape: (shape: Shape) => void;
}

export class Shape {
  id: string;
  
  isAttached = false;
  isSelected = false;
  isEditing = false;

  drawingOnly = false;
  config: ShapeConfiguration;

  static name: string = "Shape";
  static icon = Shapes;
  static cursor: string = "default";
  static panel: ShapePanelConfiguration = {
    noPanel: false,
    background: true,
    border: true,
    borderWidth: true,
    edge: false,
  };

  start: Point | null;
  end: Point | null;
  points: Point[];
  element: HTMLDivElement | null;

  constructor(config: ShapeConfiguration) {
    this.id = $ID();
    this.config = config;

    this.start = null;
    this.end = null;
    this.points = [];
    this.element = null;
  }

  static onMouseDown({ shape, config }: EventModifier): void {
    if (!shape.current) {
      shape.current = new this(config);
    }
  }

  static onMouseMove({ attach }: EventModifier): void {
  }

  static onMouseUp({ attach }: EventModifier): void {
    attach();
  }

  static onClick({ attach }: EventModifier): void {
  }

  boundedRectangle(): BondedRectangle | null {
    return null;
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    return this;
  }

  translate(delta: Point) {
    return this;
  }

  select() {
    this.isSelected = true;
    return this;
  }

  deselect() {
    this.isSelected = false;
    return this;
  }

  attach() {
    this.isAttached = true;
    return this;
  }

  edit() {
    this.isEditing = true;
    return this;
  }

  configure(ctx: OffscreenCanvasRenderingContext2D): typeof this {
    ctx.beginPath();

    ctx.lineCap = "round";
    ctx.strokeStyle = this.config.border;
    ctx.fillStyle = this.config.background;
    ctx.lineWidth = this.config.borderWidth;

    return this;
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>) {
    return false;
  }

  isEmpty() {
    return true;
  }

  duplicate() {
    const clone = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
    );
    clone.id = $ID();
    clone.isSelected = false;
    clone.isAttached = false;

    if (this.start) {
      clone.start = { x: this.start.x + 20, y: this.start.y + 20 };
    }
    if (this.end) {
      clone.end = { x: this.end.x + 20, y: this.end.y + 20 };
    }

    clone.points = this.points.map((p) => ({ x: p.x + 20, y: p.y + 20 }));
    return clone;
  }
}
