import {
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Shape } from "../../shapes";
import { ShapeConfiguration } from "../../types";
import { ColorSelector } from "../atoms/ColorSelector";
import { PanelElement } from "../atoms/PanelElement";
import { ElementSelector } from "../atoms/ElementSelector";
import { Circle, Copy, Minus, Square, Trash } from "lucide-react";

export interface ShapePanelProps extends PropsWithChildren {
  shape: typeof Shape;
  drawing: MutableRefObject<Shape | null>;
  layers: MutableRefObject<Shape[]>;
  attach: () => void;
}

export interface ShapePanelRef {
  getConfig: () => ShapeConfiguration;
}

const BACKGROUND_COLORS = [
  "#d1d5db",
  "#93c5fd",
  "#86efac",
  "#fde047",
  "#fca5a5",
];

const BORDER_COLORS = ["#374151", "#1d4ed8", "#15803d", "#a16207", "#b91c1c"];

export const ShapePanel = forwardRef<ShapePanelRef, ShapePanelProps>(
  ({ shape, drawing, layers, attach, children }, ref) => {
    const initialConfig = drawing.current?.config;
    const [background, setBackground] = useState<
      ShapeConfiguration["background"]
    >(initialConfig?.background || BACKGROUND_COLORS[0]);
    const [border, setBorder] = useState<ShapeConfiguration["border"]>(
      initialConfig?.border || BORDER_COLORS[0]
    );
    const [borderWidth, setBorderWidth] = useState<
      ShapeConfiguration["borderWidth"]
    >(initialConfig?.borderWidth || 1);
    const [edge, setEdge] = useState<ShapeConfiguration["edge"]>(
      initialConfig?.edge || "rounded"
    );

    const config: ShapeConfiguration = useMemo(
      () => ({ border, background, borderWidth, edge }),
      [border, background, borderWidth, edge]
    );

    useImperativeHandle(ref, () => ({
      getConfig() {
        return config;
      },
    }));

    useEffect(() => {
      if (drawing.current) {
        drawing.current.config = config;
      }
    }, [config, drawing]);

    const { panel } = shape;

    return (
      <div className="top-36 left-4 z-20 fixed border-gray-100 bg-white shadow-lg p-4 border rounded-lg">
        {children}

        {!panel.noPanel && (
          <div className="flex flex-col gap-4 mt-4">
            <PanelElement title="Background" show={panel.background}>
              {BACKGROUND_COLORS.map((color) => (
                <ColorSelector
                  color={color}
                  select={() => setBackground(color)}
                  isSelected={background === color}
                />
              ))}
            </PanelElement>

            <PanelElement title="Border" show={panel.border}>
              {BORDER_COLORS.map((color) => (
                <ColorSelector
                  color={color}
                  select={() => setBorder(color)}
                  isSelected={border === color}
                />
              ))}
            </PanelElement>

            <PanelElement title="Border Width" show={panel.border}>
              <ElementSelector
                isSelected={borderWidth === 1}
                select={() => setBorderWidth(1)}
              >
                <Minus strokeWidth={1} size={12} />
              </ElementSelector>

              <ElementSelector
                isSelected={borderWidth === 3}
                select={() => setBorderWidth(3)}
              >
                <Minus strokeWidth={3} size={12} />
              </ElementSelector>

              <ElementSelector
                isSelected={borderWidth === 5}
                select={() => setBorderWidth(5)}
              >
                <Minus strokeWidth={5} size={12} />
              </ElementSelector>
            </PanelElement>

            <PanelElement title="Border Radius" show={panel.edge}>
              <ElementSelector
                isSelected={edge === "rounded"}
                select={() => setEdge("rounded")}
              >
                <Circle strokeWidth={1} size={12} />
              </ElementSelector>

              <ElementSelector
                isSelected={edge === "pointy"}
                select={() => setEdge("pointy")}
              >
                <Square strokeWidth={1} size={12} />
              </ElementSelector>
            </PanelElement>

            <PanelElement
              title="Actions"
              show={
                !!drawing.current &&
                drawing.current.isSelected &&
                drawing.current.isAttached
              }
            >
              <ElementSelector
                isSelected
                select={() => {
                  layers.current = layers.current.filter(
                    (s) => s.id !== drawing.current?.id
                  );
                  drawing.current = null;
                }}
              >
                <Trash strokeWidth={1} size={12} />
              </ElementSelector>

              <ElementSelector
                isSelected
                select={() => {
                  if (drawing.current) {
                    drawing.current.isSelected = false;
                    layers.current = layers.current.map((s) => {
                      s.isSelected = false;
                      return s;
                    });

                    drawing.current = drawing.current.duplicate();
                    attach();
                  }
                }}
              >
                <Copy strokeWidth={1} size={12} />
              </ElementSelector>
            </PanelElement>
          </div>
        )}
      </div>
    );
  }
);