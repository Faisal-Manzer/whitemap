import { Hand } from "lucide-react";
import { InfoBox } from "../molecules/InfoBox";
import { Logo } from "./Logo";

export const MobileMessage = () => {
  return (
    <div className="top-0 left-0 z-10 fixed flex flex-col justify-center items-center md:hidden bg-transparent m-0 p-4 w-screen md:w-0 h-screen md:h-0 text-gray-500 visible">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl">
          <Logo full />
        </h1>

        <div>
          I apologize for any inconvenience this may cause. Currently, this
          experience is best suited for mouse use, and I truly appreciate your
          understanding. If possible, it would be wonderful if you could view it
          on a larger screen for the best experience.
        </div>

        <InfoBox
          Button={({ open }) => (
            <div
              className="flex items-center gap-2 bg-gray-100 shadow mt-4 p-2 rounded w-full text-gray-700"
              onClick={open}
            >
              <Hand size={16} /> Know More
            </div>
          )}
        />
      </div>
    </div>
  );
};
