import { useState, MouseEvent, FC } from "react";
import { ElementSelector } from "../atoms/ElementSelector";
import { CircleHelp, CircleX, Github, Linkedin } from "lucide-react";
import { Logo } from "../atoms/Logo";

const Shortcuts = {
  Pointer: ["S"],
  "Pen Tool": ["P"],
  "Rectangle Tool": ["R"],
  "Oval Tool": ["O"],
  "Text Tool": ["T"],

  "Duplicate Element": ["D"],
  "Unselect Element": ["Esc"],
  "Delete Element": ["Del", "Backspace"],

  "Export Canvas": ["E"],
  "Clear Canvas": ["C"],
};

interface InfoBoxProps {
  Button?: FC<{ open: (e: MouseEvent) => void }>;
}

export const InfoBox: FC<InfoBoxProps> = ({ Button }) => {
  const [isOpen, setOpen] = useState(false);

  const open = (e: MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const close = (e: MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      {Button ? (
        <Button open={open} />
      ) : (
        <ElementSelector title="Info" isSelected select={() => setOpen(true)}>
          <CircleHelp strokeWidth={1} size={12} />
        </ElementSelector>
      )}

      {isOpen && (
        <div
          className="top-0 left-0 z-40 fixed flex justify-center items-center bg-slate-700 bg-opacity-30 w-screen h-screen"
          onClick={close}
        >
          <div
            className="bg-white shadow-xl p-4 pt-0 rounded-lg w-[90vw] h-[90vh] overflow-scroll"
            onClick={open}
          >
            <div className="top-0 z-50 sticky flex justify-between bg-white py-4">
              <h1 className="text-xl">
                <Logo full />
              </h1>

              <CircleX onClick={close} />
            </div>

            <div className="flex md:flex-row flex-col justify-evenly gap-8">
              <div className="flex-1">
                <div className="relative flex items-center py-5">
                  <span className="flex-shrink mr-4 text-2xl text-gray-700">
                    Hi, I am{" "}
                    <span className="font-bold text-2xl text-gray-900">
                      Faisal Manzer
                    </span>
                  </span>
                  <div className="flex-grow border-gray-400 border-t"></div>
                </div>

                <div className="text-gray-400 text-justify">
                  I created WhiteMap as a fun project during my travels. In high
                  school, I used HTML Canvas to develop a game called{" "}
                  <a
                    href="https://github.com/Faisal-Manzer/iWar"
                    target="_blank"
                    className="text-blue-500"
                  >
                    iWar
                  </a>
                  . After discovering <b>Microsoft Whiteboard</b>, I was
                  inspired to take on the exciting challenge of building my own
                  drawing tool.
                </div>

                <div className="flex gap-4 mt-4">
                  <a
                    href="https://github.com/Faisal-Manzer/whitemap"
                    target="_blank"
                  >
                    <div className="flex justify-center items-center bg-gray-200 p-1 rounded text-gray-700">
                      <Github size={16} className="mr-2" />
                      GitHub
                    </div>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/faisal-manzer"
                    target="_blank"
                  >
                    <div className="flex justify-center items-center bg-gray-200 p-1 rounded text-gray-700">
                      <Linkedin size={16} className="mr-2" />
                      Linkedin
                    </div>
                  </a>
                </div>
              </div>

              <div className="flex-1">
                <div className="relative flex items-center py-5">
                  <span className="flex-shrink mr-4 text-2xl text-gray-400">
                    Keyboard shortcuts
                  </span>
                  <div className="flex-grow border-gray-400 border-t"></div>
                </div>
                <div className="border rounded text-gray-400">
                  {Object.keys(Shortcuts).map((tool) => (
                    <>
                      <div className="flex flex-row justify-between items-center p-2">
                        {tool}
                        <div className="flex flex-row gap-4">
                          {Shortcuts[tool as keyof typeof Shortcuts].map(
                            (s: string) => (
                              <div className="bg-gray-100 p-1 rounded text-gray-500">
                                {s}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <div className="flex-grow border-gray-100 border-t"></div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
