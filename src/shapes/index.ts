import { Shape } from "./Shape";

import { Oval } from "./Oval";
import { Pen } from "./Pen";
import { Rectangle } from "./Rectangle";

export { Oval, Pen, Rectangle, Shape };
export const Tools = {
  [Oval.name]: Oval,
  [Pen.name]: Pen,
  [Rectangle.name]: Rectangle,
};
