import { FC } from "react";

interface LogoProps {
  full?: boolean;
}

export const Logo: FC<LogoProps> = ({ full }) => (
  <div className="text-black">
    White<span className="font-black">Map</span>
    {full && <div className="opacity-40">Create Your Imagination</div>}
  </div>
);
