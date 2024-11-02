import { MouseEvent, RefObject, useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

const $xy = (e: MouseEvent<HTMLCanvasElement>) => ({
  x: e.clientX,
  y: e.clientY,
});
const $ID = () => (Math.random() + 1).toString(36).substring(7);

class Shape {
  id: string;
  static name: string = "Shape";

  constructor() {
    this.id = $ID();
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    console.log("[Shape:move] Not Implemented", e);
    throw new Error("[Shape:move] Not Implemented");
  }

  draw(ctx: OffscreenCanvasRenderingContext2D) {
    console.log("[Shape:draw] Not Implemented", ctx);
    throw new Error("[Shape:draw] Not Implemented");
  }
}

class Pen extends Shape {
  points: Point[];
  static name: string = "Pen";

  constructor() {
    super();
    this.points = [];
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    this.points.push($xy(e));
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
    const points = this.points;

    ctx.beginPath();

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#c0392b";

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === points.length - 1) {
        ctx.lineTo(point.x, point.y);
        break;
      }

      const pointNext = points[i + 1];
      const midX = (point.x + pointNext.x) / 2;
      const midY = (point.y + pointNext.y) / 2;

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(midX, midY);
      } else {
        ctx.quadraticCurveTo(point.x, point.y, midX, midY);
      }
    }

    ctx.stroke();
  }
}

class Rectangle extends Shape {
  static name: string = "Rectangle";

  start: Point | null;
  end: Point | null;

  constructor() {
    super();

    this.start = null;
    this.end = null;
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    if (this.start === null) {
      this.start = $xy(e);
    } else {
      this.end = $xy(e);
    }
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
    if (!this.start || !this.end) return;

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#00ff00";

    ctx.rect(
      this.start.x,
      this.start.y,
      this.end.x - this.start.x,
      this.end.y - this.start.y
    );
    ctx.stroke();
  }
}

class Oval extends Shape {
  static name: string = "Oval";

  start: Point | null;
  end: Point | null;

  constructor() {
    super();

    this.start = null;
    this.end = null;
  }

  move(e: MouseEvent<HTMLCanvasElement>): void {
    if (this.start === null) {
      this.start = $xy(e);
    } else {
      this.end = $xy(e);
    }
  }

  draw(ctx: OffscreenCanvasRenderingContext2D): void {
    if (!this.start || !this.end) return;

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0000ff";

    ctx.ellipse(
      (this.end.x + this.start.x) / 2,
      (this.end.y + this.start.y) / 2,
      Math.abs(this.end.x - this.start.x) / 2,
      Math.abs(this.end.y - this.start.y) / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }
}

enum Shapes {
  Pen = "Pen",
  Rectangle = "Rectangle",
  Oval = "Oval",
}

function App() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const realCanvasRef = useRef<HTMLCanvasElement>(null);

  const shapesRef = useRef<Shape[]>([]);
  const currentShapeRef = useRef<Shape | null>(null);

  const selectedShapeRef = useRef<Shapes>(Shapes.Pen);

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

  const realDraw = () => {
    draw(realCanvasRef, (ctx) => {
      for (const shape of shapesRef.current) {
        shape.draw(ctx);
      }
    });
  };

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const selectedShape = selectedShapeRef.current;
    if (!selectedShape) return;

    let shape: Shape | null = null;

    if (selectedShape === Shapes.Pen) shape = new Pen();
    if (selectedShape === Shapes.Rectangle) shape = new Rectangle();
    if (selectedShape === Shapes.Oval) shape = new Oval();

    if (!shape) return;
    currentShapeRef.current = shape;
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

    loop();
    return () => {
      cancelAnimationFrame(loopId);
    };
  }, []);

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
        {Object.keys(Shapes).map((shape) => (
          <div
            onClick={() => (selectedShapeRef.current = Shapes[shape as Shapes])}
          >
            {shape}
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
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
    </div>
  );
}

export default App;
