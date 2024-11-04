export interface Point {
  x: number;
  y: number;
}

export interface ShapePanelConfiguration {
  noPanel?: boolean;

  border?: boolean;
  borderWidth?: boolean;

  background?: boolean;
  edge?: boolean;
}

export interface ShapeConfiguration {
  border: string;
  borderWidth: number;

  background: string;
  edge: "rounded" | "pointy";
}

export interface BondedRectangle {
  topLeft: Point;
  bottomRight: Point;
}
