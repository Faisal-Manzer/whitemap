import { MouseEvent, useEffect, useRef } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  };

  useEffect(() => {
    let loopId: number;
    const loop = () => {
      loopId = requestAnimationFrame(loop);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      canvas.style.cursor = "default";

      const mouse = mouseRef.current;
      if (!mouse.draw) return;

      canvas.style.cursor = "crosshair";
      ctx.beginPath(); // begin

      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#c0392b";

      ctx.moveTo(mouse.oldX, mouse.oldY); // from
      ctx.lineTo(mouse.x, mouse.y);

      ctx.stroke();
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
