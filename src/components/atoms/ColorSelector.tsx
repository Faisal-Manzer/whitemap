import { FC } from "react";
import { ElementSelector } from "./ElementSelector";

interface ColorSelectorProps {
  isSelected: boolean;
  color: string;
  select: () => void;

  selectedClass?: string;
}

export const ColorSelector: FC<ColorSelectorProps> = ({
  isSelected,
  color,
  select,
  selectedClass = "border-gray-500",
}) => (
  <ElementSelector {...{ isSelected, select, selectedClass }}>
    <div className="w-full h-full" style={{ backgroundColor: color }}></div>
  </ElementSelector>
);
