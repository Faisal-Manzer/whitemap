import { CaseSensitive } from "lucide-react";

import { BondedRectangle, Point, ShapeConfiguration, ShapePanelConfiguration } from "../types";
import { EventModifier, Shape } from "./Shape";
import { $xy } from "../utils/coordinate";
import { MouseEvent } from "react";
import { isInsideBoundedRect } from "../utils/mouse";

export class Text extends Shape {
  static name: string = "Text";
  static icon = CaseSensitive;
  static cursor: string = "text";
  static panel: ShapePanelConfiguration = { ...Shape.panel };

  constructor(config: ShapeConfiguration) {
    super(config);
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, canvas: HTMLCanvasElement): typeof this {
    if (!this.start || !this.element) return this;

    if (!this.isEditing) {
      ctx.font = "normal 48px serif";
      ctx.fillStyle = "#FF0000";
  
      const rect = canvas.getBoundingClientRect();
      ctx.fillText(this.element.innerHTML || "", this.start.x, this.start.y + (this.element.clientHeight) + rect.top - 11);
    }

    return this;
  }

  static onClick({ shape, config, e, canvas, attach }: EventModifier<Text>) {
    if (shape.current || document.body !== document.activeElement) return;

    const text = new this(config);
    const rect = canvas.getBoundingClientRect();

    const id = text.id;

    const point = $xy(e);
    text.start = point;
    text.isEditing = true;

    const element = document.createElement('div');
    element.id = "text-node-" + id;

    element.classList.add("initial");
    element.contentEditable = "plaintext-only";

    element.style.top = (point.y + rect.top) + "px";
    element.style.left = (point.x + rect.left) + "px";
    
    element.style.position = "fixed";
    element.style.fontSize = "48px";
    element.style.fontFamily = "serif";
    element.style.fontWeight = "normal";
    element.style.zIndex = "10";

    document.getElementById("root")?.appendChild(element);

    element.focus();

    text.element = element;

    shape.current = text;
    attach();

    element.onfocus = () => {
      if (shape.current?.id === id) shape.current.select();
    }

    element.onblur = () => {
      if (shape.current?.id === id) shape.current.deselect();
    }
  }

  edit() {
    super.edit();

    this.isEditing = true;
    if (this.element) {
      this.element.style.zIndex = "10";
      this.element.style.visibility = "visible";
      this.element.focus();
    }

    return this;
  }

  deselect(): this {
    super.deselect();

    this.isEditing = false;
    if (this.element) {
      this.element.style.zIndex = "-10";
      this.element.style.visibility = "hidden";
    }

    return this;
  }

  translate(delta: Point) {
    if (!this.isEditing) {
      if (this.start) {
        this.start.x += delta.x;
        this.start.y += delta.y;
      }

      if (this.element) {
        this.element.style.left = (parseFloat(this.element.style.left) + delta.x) + "px";
        this.element.style.top = (parseFloat(this.element.style.top) + delta.y) + "px";
      }
    }
    
    return this;
  }

  isEmpty(): boolean {
    return !this.element;
  }

  isHovered(e: MouseEvent<HTMLCanvasElement>): boolean {
    return isInsideBoundedRect(
      e,
      this.boundedRectangle(),
    );
  }

  boundedRectangle(): BondedRectangle | null {
    if (!this.start || !this.element) return null;

    return {
      topLeft: this.start,
      bottomRight: { x: this.start.x + this.element.clientWidth, y: this.start.y + this.element.clientHeight }
    }
  }
}
