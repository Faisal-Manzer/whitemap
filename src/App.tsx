import {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import * as Shapes from "./shapes";

function App() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const realCanvasRef = useRef<HTMLCanvasElement>(null);

  const shapesRef = useRef<Shapes.Shape[]>([]);
  const currentShapeRef = useRef<Shapes.Shape | null>(null);

  const [selectedShape, setSelectedShape] = useState<keyof typeof Shapes.Tools>(
    Shapes.Pen.name,
  );

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
    paint: (ctx: OffscreenCanvasRenderingContext2D) => void,
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
        shape.draw(ctx);
      }
    });
  }, []);

  const onMouseDown = () => {
    const shape = Shapes.Tools[selectedShape];
    currentShapeRef.current = new shape();

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

    shapesRef.current = [...shapesRef.current, currentShapeRef.current];
    realDraw();

    currentShapeRef.current = null;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = Shapes.Shape.pointer;
  };

  useEffect(() => {
    let loopId: number;

    const loop = () => {
      loopId = requestAnimationFrame(loop);

      const currentShape = currentShapeRef.current;
      if (!currentShape) return;

      draw(drawingCanvasRef, (ctx) => {
        currentShape.draw(ctx);
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
      <div
        style={{
          display: "flex",
          gap: 5,
          position: "fixed",
          top: 50,
          left: 50,
          zIndex: 20,
          backgroundColor: "white",
          padding: 10,
          borderRadius: 10,
        }}
      >
        {Object.keys(Shapes.Tools).map((tool) => (
          <div onClick={() => setSelectedShape(tool)}>
            {Shapes.Tools[tool].name}
          </div>
        ))}
      </div>
      <canvas
        ref={drawingCanvasRef}
        style={{
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />

      <canvas
        ref={realCanvasRef}
        style={{
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,

          backgroundColor: "#EEE",
        }}
      />
    </div>
  );
}

export default App;
