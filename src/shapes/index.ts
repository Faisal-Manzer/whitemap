export { Shape } from "./Shape";

import { Oval } from "./Oval";
import { Pen } from "./Pen";
import { Pointer } from "./Pointer";
import { Rectangle } from "./Rectangle";

export { Oval, Pen, Pointer, Rectangle };
export const Tools = {
  [Pointer.name]: Pointer,
  [Pen.name]: Pen,
  [Rectangle.name]: Rectangle,
  [Oval.name]: Oval,
};
