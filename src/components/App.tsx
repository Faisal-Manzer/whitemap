import {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import * as Shapes from "../shapes";
import { cn } from "../utils/cn";
import { ShapePanel, ShapePanelRef } from "./panels/ShapePanel";

function App() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const realCanvasRef = useRef<HTMLCanvasElement>(null);

  const shapesRef = useRef<Shapes.Shape[]>([]);
  const currentShapeRef = useRef<Shapes.Shape | null>(null);
  const [selectedShape, setSelectedShape] = useState<keyof typeof Shapes.Tools>(
    Object.keys(Shapes.Tools)[0]
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
    paint(offScreenCanvasCtx);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
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
    if (!selectedShape || !panel) return;

    const shape = Shapes.Tools[selectedShape];
    currentShapeRef.current = new shape(panel.getConfig());

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = shape.pointer;
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    currentShapeRef.current?.move({
      ...e,
      clientX: e.clientX - rect.left,
      clientY: e.clientY - rect.top,
    });
  };

  const onMouseUp = () => {
    if (!currentShapeRef.current) return;
    if (!currentShapeRef.current.drawingOnly) {
      shapesRef.current = [...shapesRef.current, currentShapeRef.current];
    }

    currentShapeRef.current = null;
    realDraw();

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = Shapes.Shape.cursor;

    const canvasCtx = canvas.getContext("2d");
    canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    let loopId: number;
    const loop = () => {
      loopId = requestAnimationFrame(loop);
      draw(drawingCanvasRef, (ctx) => {
        currentShapeRef.current?.draw(ctx);
      });
    };

    setup(drawingCanvasRef);
    setup(realCanvasRef);

    realDraw();
    loop();

    return () => {
      cancelAnimationFrame(loopId);
    };
  }, [selectedShape, realDraw]);

  return (
    <div>
      <div className="top-4 left-0 z-20 fixed flex justify-center items-center w-screen">
        <div className="flex items-center gap-2 border-gray-100 bg-white shadow-lg p-1 border rounded-xl text-sm">
          {Object.keys(Shapes.Tools).map((tool) => {
            const isSelected = selectedShape === tool;
            const shape = Shapes.Tools[tool];
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
        shape={Shapes.Tools[selectedShape]}
        key={selectedShape + "-" + (currentShapeRef.current?.id || "none")}
      />
      <canvas
        ref={drawingCanvasRef}
        className="top-0 left-0 z-10 fixed m-0 p-0 w-screen h-screen"
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
