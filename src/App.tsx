import { MouseEvent, useEffect, useRef } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const mouseRef = useRef({
    x: 0,
    y: 0,

    oldX: 0,
    oldY: 0,

    draw: false,
  });

  const setup = () => {
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

    canvas.style.backgroundColor = "#ddd";
  };

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    mouseRef.current.draw = true;
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    if (mouseRef.current.draw)
      pointsRef.current = [
        ...pointsRef.current,
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
      ];

    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,

      oldX: mouseRef.current.x,
      oldY: mouseRef.current.y,

      draw: mouseRef.current.draw,
    };
  };

  const onMouseUp = () => {
    mouseRef.current.draw = false;
    pointsRef.current = [];
  };

  useEffect(() => {
    let loopId: number;

    const loop = () => {
      loopId = requestAnimationFrame(loop);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx) return;
      const offScreenCanvas = new OffscreenCanvas(canvas.height, canvas.width);
      const offScreenCtx = offScreenCanvas.getContext("2d");
      if (!offScreenCtx) return null;

      offScreenCtx.beginPath(); // begin

      offScreenCtx.lineWidth = 5;
      offScreenCtx.lineCap = "round";
      offScreenCtx.strokeStyle = "#c0392b";

      offScreenCtx.beginPath();
      for (let i = 0; i < pointsRef.current.length; i++) {
        const point = pointsRef.current[i];
        if (i === pointsRef.current.length - 1) {
          ctx.lineTo(point.x, point.y);
          break;
        }

        const pointNext = pointsRef.current[i + 1];
        const midX = (point.x + pointNext.x) / 2;
        const midY = (point.y + pointNext.y) / 2;

        if (i === 0) {
          offScreenCtx.moveTo(point.x, point.y);
          offScreenCtx.lineTo(midX, midY);
        } else {
          offScreenCtx.quadraticCurveTo(point.x, point.y, midX, midY);
        }
      }

      offScreenCtx.stroke();
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offScreenCanvas, 0, 0);
    };

    setup();
    loop();
    return () => {
      cancelAnimationFrame(loopId);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
    </div>
  );
}

export default App;
