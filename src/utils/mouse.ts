import { MouseEvent, MutableRefObject } from "react";
import { BondedRectangle } from "../types";

type MouseRef = MutableRefObject<MouseEvent<HTMLCanvasElement> | null>;
interface MouseParas {
  onMouseDownRef: MouseRef;
  onMouseMoveRef: MouseRef;
  onMouseUpRef: MouseRef;
  prevMouseMoveRef: MouseRef;
}

export const $click = (params: MouseParas) => {
  const { onMouseDownRef, onMouseUpRef } = params;

  return onMouseDownRef.current &&
    onMouseUpRef.current &&
    Math.abs(
        onMouseDownRef.current.clientX - onMouseUpRef.current.clientX,
      ) <= 5 &&
    Math.abs(
        onMouseDownRef.current.clientY - onMouseUpRef.current.clientY,
      ) <= 5;
};

export const $drag = (params: MouseParas) => {
  const {
    onMouseDownRef,
    onMouseMoveRef,
    onMouseUpRef,
    prevMouseMoveRef,
  } = params;

  return onMouseDownRef.current &&
    onMouseMoveRef.current &&
    prevMouseMoveRef.current &&
    !onMouseUpRef.current;
};

export const isInsideBoundedRect = (e: MouseEvent<HTMLCanvasElement>, rect: BondedRectangle | null) => {
  if (!rect) return false;

  const { topLeft, bottomRight } = rect;
  return (topLeft.x <= e.clientX && e.clientX <= bottomRight.x &&
    topLeft.y <= e.clientY && e.clientY <= bottomRight.y);
};
