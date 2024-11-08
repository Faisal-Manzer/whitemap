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
import { Logo } from "../atoms/Logo";

export interface ShapePanelProps extends PropsWithChildren {
  shape: typeof Shape;
  selected: Shape | null;
  drawing: MutableRefObject<Shape | null>;

  deleteSelected: () => void;
  duplicateShape: () => void;
  updateConfig: (config: ShapeConfiguration) => void;
}

export interface ShapePanelRef {
  getConfig: () => ShapeConfiguration;
}

const BG_COLORS = ["#f3f4f6", "#dbeafe", "#dcfce7", "#fef9c3", "#ffe4e6"];
const BORDER_COLORS = ["#6b7280", "#3b82f6", "#22c55e", "#eab308", "#f43f5e"];
const FONT_COLORS = ["#374151", "#1d4ed8", "#15803d", "#a16207", "#b91c1c"];

type ShapeConstructor = typeof Shape | undefined | null;
export const ShapePanel = forwardRef<ShapePanelRef, ShapePanelProps>(
  (
    {
      shape: s,
      drawing,
      selected,
      deleteSelected,
      duplicateShape,
      children,
      updateConfig,
    },
    ref
  ) => {
    const current = selected || drawing.current;
    const initialConfig = current?.config;

    const shape = (current?.constructor as ShapeConstructor) || s;

    const [background, setBackground] = useState<
      ShapeConfiguration["background"]
    >(initialConfig?.background || BG_COLORS[0]);

    const [border, setBorder] = useState<ShapeConfiguration["border"]>(
      initialConfig?.border || BORDER_COLORS[0]
    );

    const [borderWidth, setBorderWidth] = useState<
      ShapeConfiguration["borderWidth"]
    >(initialConfig?.borderWidth || 1);

    const [edge, setEdge] = useState<ShapeConfiguration["edge"]>(
      initialConfig?.edge || "rounded"
    );

    const [fontColor, setFontColor] = useState<ShapeConfiguration["fontColor"]>(
      initialConfig?.fontColor || FONT_COLORS[0]
    );

    const config: ShapeConfiguration = useMemo(
      () => ({
        border,
        background,
        borderWidth,
        edge,
        fontColor,
        fontSize: 24,
      }),
      [border, background, borderWidth, edge, fontColor]
    );

    useImperativeHandle(ref, () => ({
      getConfig() {
        return config;
      },
    }));

    useEffect(() => {
      updateConfig(config);
    }, [config, updateConfig]);

    const { panel } = shape as typeof Shape;

    return (
      <div className="top-4 right-4 z-20 fixed md:flex flex-col gap-4 border-gray-100 hidden bg-white shadow-lg p-4 border rounded-lg">
        <div className="flex flex-row justify-between items-center">
          <div>
            <Logo />
          </div>
        </div>

        {children}

        {!panel.noPanel && (
          <div className="flex flex-col gap-4">
            <PanelElement title="Background" show={panel.background}>
              {BG_COLORS.map((color, index) => (
                <ColorSelector
                  key={color}
                  color={color}
                  select={() => {
                    setBackground(color);
                    setBorder(BORDER_COLORS[index]);
                  }}
                  isSelected={background === color}
                />
              ))}
            </PanelElement>

            <PanelElement title="Border" show={panel.border}>
              {BORDER_COLORS.map((color) => (
                <ColorSelector
                  key={color}
                  color={color}
                  select={() => setBorder(color)}
                  isSelected={border === color}
                />
              ))}
            </PanelElement>

            <PanelElement title="Font Color" show={panel.fontColor}>
              {FONT_COLORS.map((color) => (
                <ColorSelector
                  key={color}
                  color={color}
                  select={() => setFontColor(color)}
                  isSelected={fontColor === color}
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
              show={!!current && current.isSelected && current.isAttached}
            >
              <ElementSelector isSelected={false} select={deleteSelected}>
                <Trash strokeWidth={1.5} size={16} />
              </ElementSelector>

              <ElementSelector isSelected={false} select={duplicateShape}>
                <Copy strokeWidth={1.5} size={16} />
              </ElementSelector>
            </PanelElement>
          </div>
        )}
      </div>
    );
  }
);
