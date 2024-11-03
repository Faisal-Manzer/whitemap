import { FC, PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

interface ElementSelectorProps extends PropsWithChildren {
  isSelected: boolean;
  select: () => void;

  selectedClass?: string;
}

export const ElementSelector: FC<ElementSelectorProps> = ({
  isSelected,
  select,
  selectedClass = "bg-gray-200",
  children,
}) => (
  <div
    className={cn(
      "p-0.5 border-2 rounded-lg border-white",
      isSelected && selectedClass,
    )}
  >
    <div
      onClick={select}
      className="flex justify-center items-center rounded w-5 h-5 cursor-pointer overflow-clip"
    >
      {children}
    </div>
  </div>
);
