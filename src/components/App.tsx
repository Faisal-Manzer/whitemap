import {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Shape, Tools, Pointer } from "../shapes";
import { cn } from "../utils/cn";
import { ShapePanel, ShapePanelRef } from "./panels/ShapePanel";
import { $box } from "../utils/coordinate";

function App() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const realCanvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);

  const shapesRef = useRef<Shape[]>([]);
  const currentShapeRef = useRef<Shape | null>(null);
  const [selectedShape, setSelectedShape] = useState<keyof typeof Tools>(
    Pointer.name
  );

  const panelRef = useRef<ShapePanelRef>(null);

  const setup = (canvasRef: RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.ceil(window.devicePixelRatio);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(ratio, ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  };

  const draw = (
    canvasRef: RefObject<HTMLCanvasElement>,
    paint: (ctx: OffscreenCanvasRenderingContext2D) => void
  ) => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");
    if (!canvas || !canvasCtx) return;

    const offScreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const offScreenCanvasCtx = offScreenCanvas.getContext("2d");

    if (!offScreenCanvasCtx) return;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    paint(offScreenCanvasCtx);
    canvasCtx.drawImage(offScreenCanvas, 0, 0);
  };

  const realDraw = useCallback(() => {
    draw(realCanvasRef, (ctx) => {
      for (const shape of shapesRef.current) {
        if (!shape.isSelected) shape.draw(ctx);
      }
    });
  }, []);

  const onMouseDown = () => {
    const panel = panelRef.current;
    if (!panel) return;
    if (currentShapeRef.current?.isSelected) return;

    const shape = Tools[selectedShape];
    currentShapeRef.current = new shape(panel.getConfig());
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    mouseRef.current = e;
  };

  const onMouseUp = () => {
    console.log("[onMouseUp]");

    if (!currentShapeRef.current) return;
    if (currentShapeRef.current.isSelected) return;

    if (!currentShapeRef.current.drawingOnly) {
      shapesRef.current = [...shapesRef.current, currentShapeRef.current];
    }

    currentShapeRef.current = null;
    realDraw();

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = Shape.cursor;
    const canvasCtx = canvas.getContext("2d");
    canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const resetSelected = useCallback(() => {
    if (currentShapeRef.current?.isSelected) {
      currentShapeRef.current.isSelected = false;
      shapesRef.current = [...shapesRef.current, currentShapeRef.current];

      currentShapeRef.current = null;
      realDraw();
    }
  }, [realDraw]);

  const onClick = (e: MouseEvent<HTMLCanvasElement>) => {
    resetSelected();

    if (selectedShape !== Pointer.name) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const clickedElements = shapesRef.current.filter((shape) =>
      shape.isHovered($box(canvas, e))
    );

    if (clickedElements.length > 0) {
      currentShapeRef.current = clickedElements[clickedElements.length - 1];
      currentShapeRef.current.isSelected = true;
      shapesRef.current = shapesRef.current.filter(
        (s) => s.id !== currentShapeRef.current?.id
      );

      realDraw();
    }
  };

  const updateCursorStyle = useCallback(() => {
    const e = mouseRef.current;
    const canvas = drawingCanvasRef.current;

    if (!e || !canvas) return;

    if (currentShapeRef.current) {
      if (currentShapeRef.current.isSelected) return;

      currentShapeRef.current.move($box(canvas, e));
      canvas.style.cursor = Tools[selectedShape].cursor;
    } else if (selectedShape === Pointer.name) {
      const hoveredElement = shapesRef.current.filter((shape) =>
        shape.isHovered(mouseRef.current!)
      );
      if (hoveredElement.length > 0) canvas.style.cursor = "move";
      else canvas.style.cursor = "default";
    } else {
      canvas.style.cursor = "default";
    }
  }, [selectedShape]);

  useEffect(() => {
    let loopId: number;
    const loop = () => {
      loopId = requestAnimationFrame(loop);

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
  }, [realDraw, updateCursorStyle]);

  useEffect(() => {
    if (currentShapeRef.current?.isSelected) {
      resetSelected();
    }
  }, [selectedShape, resetSelected]);

  return (
    <div>
      <div className="top-4 left-0 z-20 fixed flex justify-center items-center w-screen">
        <div className="flex items-center gap-2 border-gray-100 bg-white shadow-lg p-1 border rounded-xl text-sm">
          {Object.keys(Tools).map((tool) => {
            const isSelected = selectedShape === tool;
            const shape = Tools[tool];
            const { icon: Icon } = shape;

            return (
              <div
                onClick={() => setSelectedShape(tool)}
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
        shape={Tools[selectedShape]}
        key={selectedShape + "-" + (currentShapeRef.current?.id || "none")}
      />
      <canvas
        ref={drawingCanvasRef}
        className="top-0 left-0 z-10 fixed opacity-70 m-0 p-0 w-screen h-screen"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
      />
      <canvas
        ref={realCanvasRef}
        className="top-0 left-0 z-0 fixed m-0 p-0 w-screen h-screen"
      />
    </div>
  );
}

export default App;
