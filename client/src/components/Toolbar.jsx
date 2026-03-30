import React, { useEffect, useState } from "react";
import { GameEvent, RoomState } from "../types";
import { socket } from "../socketHandler";
import Button from "./ui/Button";
import { useRoom } from "../context/RoomContext";
import LineWidthSelector from "./Toolbar/LineWidthSelector";

function splitArray(arr) {
  const mid = Math.floor(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

const colors = [
  "#FFFFFF",
  "#c1c1c1",
  "#ef130b",
  "#ff7100",
  "#ffe400",
  "#00cc00",
  "#00ff91",
  "#00b2ff",
  "#231fd3",
  "#a300ba",
  "#df69a7",
  "#ffac8e",
  "#a0522d",

  "#000000",
  "#505050",
  "#740b07",
  "#c23800",
  "#e8a200",
  "#004619",
  "#00785d",
  "#00569e",
  "#0e0865",
  "#550069",
  "#873554",
  "#cc774d",
  "#63300d",
];

const Toolbar = ({
  onLineWidthChange,
  onColorChange,
  handleUndo,
  handleClear,
}) => {
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF");
  const [selectedLineWidth, setSelectedLineWidth] = useState(5);

  const { myTurn, roomState } = useRoom();

  useEffect(() => {
    onColorChange(primaryColor);
  }, [onColorChange, primaryColor]);

  const handleLineWidthChange = (width) => {
    setSelectedLineWidth(width);
    onLineWidthChange(width);
  };

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    onColorChange(color);
  };

  const handleSwap = () => {
    const temp = primaryColor;
    setPrimaryColor(secondaryColor);
    setSecondaryColor(temp);
  };

  // if (roomState !== RoomState.DRAWING) {
  //   return null;
  // }
const isDisabled = !myTurn || roomState !== RoomState.DRAWING;
  return (
    
    <div className="px-3 py-2 flex items-center gap-3 flex-wrap w-full">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 border-2 border-gray-300 rounded-md overflow-hidden relative">
          <div className={`px-5 py-2 flex ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}></div>
          <div
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
            onClick={handleSwap}
            style={{
              background: `linear-gradient(to bottom right, ${primaryColor} 50%, ${secondaryColor} 50%)`,
            }}
          ></div>
        </div>

        <div className="flex flex-col">
          {splitArray(colors).map((clrs, i) => (
            <div className="flex" key={i}>
              {clrs.map((color, j) => (
                <div
                  key={j}
                  onClick={() => handleColorChange(color)}
                  className="w-5 h-5 cursor-pointer"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          ))}
        </div>

        <LineWidthSelector
          onSelect={handleLineWidthChange}
          selectedWidth={selectedLineWidth}
        />
      </div>

      <div>
        <button>h</button>
        <button>d</button>
      </div>

<div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleUndo}
          disabled={isDisabled}
        >
          Undo
        </Button>
<Button
  variant="outline"
  onClick={handleClear}
  disabled={isDisabled}
>
          Clear
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;