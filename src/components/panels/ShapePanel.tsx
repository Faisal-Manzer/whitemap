import { forwardRef, useState, useImperativeHandle } from "react";
import { Shape } from "../../shapes";
import { ShapeConfiguration } from "../../types";
import { ColorSelector } from "../atoms/ColorSelector";
import { PanelElement } from "../atoms/PanelElement";
import { ElementSelector } from "../atoms/ElementSelector";
import { Minus } from "lucide-react";

export interface ShapePanelProps {
  shape: typeof Shape;
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
  ({ shape }, ref) => {
    const [background, setBackground] = useState(BACKGROUND_COLORS[0]);
    const [border, setBorder] = useState(BORDER_COLORS[0]);
    const [borderWidth, setBorderWidth] = useState(1);

    useImperativeHandle(ref, () => ({
      getConfig() {
        return { border, background, borderWidth };
      },
    }));

    const { panel, icon: Icon, name } = shape;
    if (panel.noPanel) return null;

    return (
      <div className="top-36 left-4 z-20 fixed bg-white shadow-lg p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4 text-gray-400 text-md">
          <Icon size={12} fill="#9ca3af" />
          <div>{name}</div>
        </div>

        <div className="flex flex-col gap-4 text-gray-500 text-xs">
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
              <Minus strokeWidth={1} />
            </ElementSelector>

            <ElementSelector
              isSelected={borderWidth === 3}
              select={() => setBorderWidth(3)}
            >
              <Minus strokeWidth={3} />
            </ElementSelector>

            <ElementSelector
              isSelected={borderWidth === 5}
              select={() => setBorderWidth(5)}
            >
              <Minus strokeWidth={5} />
            </ElementSelector>
          </PanelElement>
        </div>
      </div>
    );
  }
);
