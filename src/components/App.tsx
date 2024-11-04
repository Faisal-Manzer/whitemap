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
          shape.draw(ctx);
        }
      }

      if (drawingRef.current && !drawingRef.current.isAttached) {
        drawingRef.current.draw(ctx);
      }

      for (const shape of layersRef.current) {
        if (shape.isSelected) {
          drawBoundingBox(ctx, shape.boundedRectangle());
        }
      }
    });
  }, []);

  const resetMouse = useCallback(() => {
    onMouseDownRef.current = null;
    onMouseMoveRef.current = null;
    onMouseUpRef.current = null;
  }, []);

  const selectShape = useCallback((shape: Shape, setTool = true) => {
    shape.isSelected = true;
    drawingRef.current = shape;

    setMode("select");
    setSelected(shape);
    if (setTool) setActiveToolName(shape.constructor.name);
  }, []);

  const deselectAll = useCallback(() => {
    drawingRef.current = null;
    layersRef.current = layersRef.current.map((s) => {
      s.isSelected = false;
      return s;
    });

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

  const attach = useCallback(() => {
    if (!drawingRef.current) return;
    if (drawingRef.current.isEmpty()) return;
    if (drawingRef.current.drawingOnly) return;

    if (!drawingRef.current.isAttached) {
      drawingRef.current.isAttached = true;
      layersRef.current.push(drawingRef.current);

      selectShape(drawingRef.current);
    }

    drawingRef.current = null;
  }, [selectShape]);

  const runEvent = useCallback(
    (
      name: "onMouseUp" | "onMouseMove" | "onMouseDown",
      ref: MutableRefObject<MouseEvent<
        HTMLCanvasElement,
        globalThis.MouseEvent
      > | null>
    ) => {
      if (!panelRef.current) return;

      if (ref.current) {
        activeTool[name]({
          e: ref.current,
          shape: drawingRef,
          config: panelRef.current.getConfig(),
          attach,
        });
        ref.current = null;
      }
    },
    [activeTool, attach]
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
      const mouse = {
        onMouseDownRef,
        onMouseMoveRef,
        onMouseUpRef,
        prevMouseMoveRef,
      };

      if ($click(mouse)) {
        const hoveredElements = layersRef.current.filter((s) =>
          onMouseUpRef.current ? s.isHovered(onMouseUpRef.current) : false
        );

        deselectAll();
        if (hoveredElements.length > 0) {
          selectShape(hoveredElements[hoveredElements.length - 1]);
        }

        return resetMouse();
      }

      if (mode === "select" && $drag(mouse)) {
        for (const layer of layersRef.current) {
          if (layer.isSelected) {
            translateSelected();
            break;
          }
        }
      }

      if (mode === "draw") {
        runEvent("onMouseDown", onMouseDownRef);
        runEvent("onMouseMove", onMouseMoveRef);
        runEvent("onMouseUp", onMouseUpRef);
      }

      drawOnRealCanvas();
    };

    setup(realCanvasRef);
    loop();

    return () => {
      cancelAnimationFrame(loopId);
    };
  }, [
    activeToolName,
    runEvent,
    drawOnRealCanvas,
    mode,
    attach,
    selectShape,
    resetMouse,
    deselectAll,
    translateSelected,
  ]);

  return (
    <div>
      <ShapePanel
        ref={panelRef}
        shape={activeTool}
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
                isSelected={isSelected}
                select={() => {
                  resetMouse();
                  deselectAll();
                  setActiveToolName(tool);
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
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
    </div>
  );
}

export default App;
