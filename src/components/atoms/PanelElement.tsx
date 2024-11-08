import { FC, PropsWithChildren } from "react";

export interface PanelElementProps extends PropsWithChildren {
  title: string;
  show?: boolean;
}

export const PanelElement: FC<PanelElementProps> = ({
  title,
  children,
  show,
}) => {
  if (!show) return null;

  return (
    <div>
      <div className="text-gray-500 text-xs">{title}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};
