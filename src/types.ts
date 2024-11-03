export interface Point {
  x: number;
  y: number;
}

export interface ShapePanelConfiguration {
  noPanel?: boolean;
  border?: boolean;
  background?: boolean;
  borderWidth?: number;
}

export interface ShapeConfiguration {
  border: string;
  borderWidth: number;

  background: string;
}

export interface BondedRectangle {
  topLeft: Point;
  // topRight: Point;
  // bottomLeft: Point;
  bottomRight: Point;
}
