import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import { Pointer, Shape, Tools } from "../shapes";
import { cn } from "../utils/cn";
import { ShapePanel, ShapePanelRef } from "./panels/ShapePanel";
import { $box } from "../utils/coordinate";
import { draw, setup } from "../utils/drawing";

function App() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const realCanvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);
  const prevMouseRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);

  const shapesRef = useRef<Shape[]>([]);
  const currentShapeRef = useRef<Shape | null>(null);

  const [activeTool, setActiveTool] = useState<keyof typeof Tools>(
    Pointer.name
  );

  const panelRef = useRef<ShapePanelRef>(null);
  const isPointerActive = activeTool === Pointer.name;

  const realDraw = useCallback(() => {
    draw(realCanvasRef, (ctx) => {
      for (const shape of shapesRef.current) {
        shape.draw(ctx);
      }
    });
  }, []);

  const initShape = () => {
    const panel = panelRef.current;
    if (!panel) return;

    const shape = Tools[activeTool];
    currentShapeRef.current = new shape(panel.getConfig());
  };

  const getHoveredElements = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return [];

    return shapesRef.current.filter((shape) =>
      shape.isHovered($box(canvas, e))
    );
  }, []);

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isPointerActive) {
      const hoveredElements = getHoveredElements(e);
      if (hoveredElements.length > 0) {
        currentShapeRef.current = hoveredElements[hoveredElements.length - 1];
        shapesRef.current = shapesRef.current.filter(
          (s) => s.id !== currentShapeRef.current?.id
        );

        return;
      } else {
        initShape();
      }
    } else initShape();
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    prevMouseRef.current = mouseRef.current;
    mouseRef.current = e;
  };

  const onMouseUp = () => {
    const currentShape = currentShapeRef.current;
    if (!currentShape) return;

    if (!currentShape.drawingOnly) {
      shapesRef.current = [...shapesRef.current, currentShape];
    }

    currentShapeRef.current = null;
    realDraw();

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = Shape.cursor;
    const canvasCtx = canvas.getContext("2d");
    canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const updateCursorStyle = useCallback(() => {
    const e = mouseRef.current;
    const canvas = drawingCanvasRef.current;

    if (!e || !canvas) return;
    if (isPointerActive) {
      if (currentShapeRef.current) {
        canvas.style.cursor = "move";
        return;
      }

      const hoveredElements = getHoveredElements(e);
      if (hoveredElements.length > 0) canvas.style.cursor = "move";
      else canvas.style.cursor = "default";

      return;
    }

    if (currentShapeRef.current) {
      canvas.style.cursor = Tools[activeTool].cursor;
    } else {
      canvas.style.cursor = "default";
    }
  }, [activeTool, isPointerActive, getHoveredElements]);

  useEffect(() => {
    let loopId: number;
    const loop = () => {
      loopId = requestAnimationFrame(loop);

      if (currentShapeRef.current) {
        if (mouseRef.current) {
          if (
            isPointerActive &&
            currentShapeRef.current?.constructor.name !== Pointer.name
          ) {
            if (prevMouseRef.current) {
              const dX =
                mouseRef.current.clientX - prevMouseRef.current.clientX;
              const dY =
                mouseRef.current.clientY - prevMouseRef.current.clientY;
              currentShapeRef.current?.translate(dX, dY);
            }
          } else currentShapeRef.current?.move(mouseRef.current);
        }

        prevMouseRef.current = null;
      }

      draw(drawingCanvasRef, (ctx) => {
        currentShapeRef.current?.draw(ctx);
      });
      updateCursorStyle();
    };

    setup(drawingCanvasRef);
    setup(realCanvasRef);

    realDraw();
    loop();

    return () => {
      cancelAnimationFrame(loopId);
    };
  }, [realDraw, updateCursorStyle, isPointerActive]);

  return (
    <div>
      <div className="top-4 left-0 z-20 fixed flex justify-center items-center w-screen">
        <div className="flex items-center gap-2 border-gray-100 bg-white shadow-lg p-1 border rounded-xl text-sm">
          {Object.keys(Tools).map((tool) => {
            const isSelected = tool === activeTool;
            const shape = Tools[tool];
            const { icon: Icon } = shape;

            return (
              <div
                onClick={() => setActiveTool(tool)}
                key={tool}
                className={cn(
                  "p-2 cursor-pointer",
                  isSelected && "bg-gray-200 rounded-lg"
                )}
                title={tool}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  fill={isSelected ? "#000" : "#FFF"}
                />
              </div>
            );
          })}
        </div>
      </div>
      <ShapePanel
        ref={panelRef}
        shape={
          activeTool === Pointer.name
            ? currentShapeRef.current?.constructor
              ? Tools[currentShapeRef.current?.constructor.name]
              : Pointer
            : Tools[activeTool]
        }
        key={activeTool + "-" + (currentShapeRef.current?.id || "none")}
      />
      <canvas
        ref={drawingCanvasRef}
        className="top-0 left-0 z-10 fixed opacity-70 m-0 p-0 w-screen h-screen"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
      <canvas
        ref={realCanvasRef}
        className="top-0 left-0 z-0 fixed m-0 p-0 w-screen h-screen"
      />
    </div>
  );
}

export default App;
