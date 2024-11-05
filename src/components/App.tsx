import {
  MouseEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Pen, Shape, Tools } from "../shapes";
import { ShapePanel, ShapePanelRef } from "./molecules/ShapePanel";
import { $box } from "../utils/coordinate";
import { draw, drawBoundingBox, setup } from "../utils/drawing";
import { PanelElement } from "./atoms/PanelElement";
import { ElementSelector } from "./atoms/ElementSelector";
import { $click, $drag } from "../utils/mouse";

function App() {
  const realCanvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<ShapePanelRef>(null);

  const [mode, setMode] = useState<"draw" | "select">("draw");
  const [activeToolName, setActiveToolName] = useState<keyof typeof Tools>(
    Pen.name
  );
  const activeTool = Tools[activeToolName];

  const prevMouseMoveRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);

  const onMouseDownRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);
  const onMouseMoveRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);
  const onMouseUpRef = useRef<MouseEvent<HTMLCanvasElement> | null>(null);

  const drawingRef = useRef<Shape | null>(null);
  const layersRef = useRef<Shape[]>([]);
  const [selected, setSelected] = useState<Shape | null>(null);

  const drawOnRealCanvas = useCallback(() => {
    draw(realCanvasRef, (ctx) => {
      for (const shape of layersRef.current) {
        if (shape.isAttached) {
          shape.draw(ctx, realCanvasRef.current!);
        }
      }

      if (drawingRef.current && !drawingRef.current.isAttached) {
        drawingRef.current.draw(ctx, realCanvasRef.current!);
      }

      for (const shape of layersRef.current) {
        if (shape.isSelected && mode === "select") {
          drawBoundingBox(ctx, shape.boundedRectangle());
        }
      }
    });
  }, [mode]);

  const resetMouse = useCallback(() => {
    onMouseDownRef.current = null;
    onMouseMoveRef.current = null;
    onMouseUpRef.current = null;
  }, []);

  const selectShape = useCallback((shape: Shape, setTool = true) => {
    shape.select();
    drawingRef.current = shape;

    setMode("select");
    setSelected(shape);
    if (setTool) setActiveToolName(shape.constructor.name);
  }, []);

  const deselectAll = useCallback(() => {
    drawingRef.current = null;
    layersRef.current = layersRef.current.map((s) => s.deselect());

    setMode("draw");
    setSelected(null);
  }, []);

  const translateSelected = useCallback(() => {
    const delta = {
      x: onMouseMoveRef.current!.clientX - prevMouseMoveRef.current!.clientX,
      y: onMouseMoveRef.current!.clientY - prevMouseMoveRef.current!.clientY,
    };

    for (const layer of layersRef.current) {
      if (layer.isSelected) layer.translate(delta);
    }
  }, []);

  const attachShape = useCallback(
    (shape: Shape) => {
      if (!shape) return;
      if (!shape.isAttached && !shape.isEmpty() && !shape.drawingOnly) {
        shape.attach();
        layersRef.current.push(shape);

        selectShape(shape);
        setMode("select");
      }
    },
    [selectShape]
  );

  const attach = useCallback(() => {
    if (!drawingRef.current) return;
    attachShape(drawingRef.current);

    drawingRef.current = null;
  }, [attachShape]);

  const runEvent = useCallback(
    (
      name: "onMouseUp" | "onMouseMove" | "onMouseDown" | "onClick",
      ref: MutableRefObject<MouseEvent<
        HTMLCanvasElement,
        globalThis.MouseEvent
      > | null>
    ) => {
      const canvas = realCanvasRef.current;
      if (!panelRef.current || !canvas) return;

      if (ref.current) {
        activeTool[name]({
          canvas,
          e: ref.current,
          shape: drawingRef,
          config: panelRef.current.getConfig(),
          attach,
          attachShape,
        });
        // ref.current = null;
      }
    },
    [activeTool, attach, attachShape]
  );

  const registerEvent =
    (ref: MutableRefObject<MouseEvent<HTMLCanvasElement> | null>) =>
    (e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = realCanvasRef.current;
      if (!canvas) return;

      ref.current = $box(canvas, e);
    };

  useEffect(() => {
    let loopId: number;
    const loop = () => {
      loopId = requestAnimationFrame(loop);

      // console.log(layersRef.current);
      const canvas = realCanvasRef.current;
      if (!canvas) return;

      const mouse = {
        onMouseDownRef,
        onMouseMoveRef,
        onMouseUpRef,
        prevMouseMoveRef,
      };

      const hoveredElements = layersRef.current.filter((s) =>
        onMouseMoveRef.current ? s.isHovered(onMouseMoveRef.current) : false
      );

      if ($click(mouse)) {
        const isSelectedClicked = hoveredElements.some(
          (s) =>
            onMouseUpRef.current &&
            s.id === selected?.id &&
            s.isHovered(onMouseUpRef.current)
        );

        const wasSelected = !!selected;
        deselectAll();
        if (hoveredElements.length > 0) {
          selectShape(hoveredElements[hoveredElements.length - 1]);
          if (isSelectedClicked) selected?.edit();
        } else {
          if (!wasSelected) runEvent("onClick", onMouseUpRef);
        }

        return resetMouse();
      }

      if (mode === "select") {
        if ($drag(mouse)) {
          for (const layer of layersRef.current) {
            if (layer.isSelected) {
              translateSelected();
              break;
            }
          }
        }
      }

      if (mode === "draw") {
        runEvent("onMouseDown", onMouseDownRef);
        runEvent("onMouseMove", onMouseMoveRef);
        runEvent("onMouseUp", onMouseUpRef);
      }

      if (hoveredElements.length > 0) canvas.style.cursor = "pointer";
      else if (selected) canvas.style.cursor = "move";
      else canvas.style.cursor = activeTool.cursor;

      drawOnRealCanvas();
    };

    setup(realCanvasRef);
    loop();

    return () => {
      cancelAnimationFrame(loopId);
    };
  }, [
    activeTool,
    activeToolName,
    runEvent,
    drawOnRealCanvas,
    mode,
    attach,
    selected,
    selectShape,
    resetMouse,
    deselectAll,
    translateSelected,
  ]);

  return (
    <>
      <ShapePanel
        ref={panelRef}
        shape={activeTool as unknown as typeof Shape}
        selected={selected}
        drawing={drawingRef}
        layers={layersRef}
        attach={attach}
        key={activeTool + (selected?.id || "-")}
      >
        <PanelElement title="Tools" show>
          {Object.keys(Tools).map((tool) => {
            const isSelected = tool === activeToolName;
            const shape = Tools[tool];
            const { icon: Icon } = shape;

            return (
              <ElementSelector
                key={tool}
                isSelected={isSelected}
                select={() => {
                  resetMouse();
                  deselectAll();
                  setActiveToolName(tool);
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={3}
                  fill={isSelected ? "#000" : "#FFF"}
                />
              </ElementSelector>
            );
          })}
        </PanelElement>
      </ShapePanel>

      <canvas
        ref={realCanvasRef}
        className="top-0 left-0 z-0 fixed m-0 p-0 w-screen h-screen"
        onMouseDown={registerEvent(onMouseDownRef)}
        onMouseMove={(e) => {
          prevMouseMoveRef.current = onMouseMoveRef.current;
          registerEvent(onMouseMoveRef)(e);
        }}
        onMouseUp={registerEvent(onMouseUpRef)}
      />
    </>
  );
}

export default App;
