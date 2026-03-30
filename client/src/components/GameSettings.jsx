import React, { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import RoomLink from "./RoomLink";
import Button from "./ui/Button";
import {
  Clock,
  Gamepad2,
  Globe,
  Lightbulb,
  RotateCw,
  Users,
} from "lucide-react";
import { GameEvent, Languages, SettingValue } from "../types";

export default function GameSettings() {
  const { settings, creator, changeSetting, isPrivateRoom } = useRoom();

  const [gameSettings, setGameSettings] = useState(settings);
  const [customWords, setCustomWords] = useState(settings.customWords.join(","));

  const isOwner = creator === socket.id;

  function handleSettingChange(setting, value, emitEvent = false) {
    changeSetting(setting, value.toString());

    switch (setting) {
      case SettingValue.players:
        setGameSettings({ ...gameSettings, players: value });
        break;
      case SettingValue.drawTime:
        setGameSettings({ ...gameSettings, drawTime: value });
        break;
      case SettingValue.rounds:
        setGameSettings({ ...gameSettings, rounds: value });
        break;
      case SettingValue.wordCount:
        setGameSettings({ ...gameSettings, wordCount: value });
        break;
      case SettingValue.hints:
        setGameSettings({ ...gameSettings, hints: value });
        break;
      case SettingValue.language:
        setGameSettings({ ...gameSettings, language: value });
        break;
      case SettingValue.onlyCustomWords:
        setGameSettings({ ...gameSettings, onlyCustomWords: value === 1 || value === true });
        break;
      default:
        break;
    }

    if (emitEvent && isOwner) {
      socket.emit(GameEvent.CHANGE_SETTIING, setting, value);
    }
  }

  useEffect(() => {
    socket.on(GameEvent.SETTINGS_CHANGED, handleSettingChange);
    return () => {
      socket.off(GameEvent.SETTINGS_CHANGED, handleSettingChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    if (!isOwner) return;
    socket.emit(GameEvent.START_GAME, {
      words: customWords.split(",").map((w) => w.trim()),
    });
  };

  const settingsOptions = [
    {
      label: "Players",
      value: gameSettings.players,
      type: SettingValue.players,
      icon: <Users size={18} />,
      options: [...Array(7)].map((_, i) => ({ value: i + 2, label: i + 2 })),
    },
    {
      label: "Language",
      value: gameSettings.language,
      type: SettingValue.language,
      icon: <Globe size={18} />,
      options: Object.entries(Languages).map(([key, val]) => ({ value: key, label: val })),
    },
    {
      label: "Drawtime",
      value: gameSettings.drawTime,
      type: SettingValue.drawTime,
      icon: <Clock size={18} />,
      options: [...Array(23)].map((_, i) => ({ value: i * 10 + 20, label: i * 10 + 20 })),
    },
    {
      label: "Rounds",
      value: gameSettings.rounds,
      type: SettingValue.rounds,
      icon: <RotateCw size={18} />,
      options: [...Array(8)].map((_, i) => ({ value: i + 1, label: i + 1 })),
    },
    {
      label: "Word Count",
      value: gameSettings.wordCount,
      type: SettingValue.wordCount,
      icon: <Gamepad2 size={18} />,
      options: [...Array(5)].map((_, i) => ({ value: i + 1, label: i + 1 })),
    },
    {
      label: "Hints",
      value: gameSettings.hints,
      type: SettingValue.hints,
      icon: <Lightbulb size={18} />,
      options: [...Array(3)].map((_, i) => ({ value: i + 1, label: i + 1 })),
    },
  ];

  // if (!isPrivateRoom) {
  //   return (
  //     <div className="w-full h-full p-2 sm:p-6 text-white justify-center flex-col flex items-center text-2xl sm:text-5xl gap-5">
  //       Waiting for players
  //       <span className="text-base sm:text-xl">
  //         The game will start as soon as a player joins
  //       </span>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full h-full p-2 sm:p-6">
      <div className="sm:space-y-2 flex flex-col flex-wrap">
        {settingsOptions.map((item, index) => (
          <div className="flex justify-between items-center" key={index}>
            <label htmlFor={item.label} className="block text-sm font-medium text-gray-200 mb-1">
              <div className="flex gap-2">{item.icon} {item.label}</div>
            </label>
            <select
              id={item.label}
              value={item.value}
              onChange={(event) => handleSettingChange(item.type, event.target.value, true)}
              disabled={!isOwner}
              className="w-1/2 p-1 sm:p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
            >
              {item.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex justify-between items-center">
          <label htmlFor="custom-words" className="block text-sm font-medium text-gray-200 mb-1">
            Custom Words
          </label>
          <div className="flex items-center">
            <label htmlFor="custom-words-only" className="text-sm font-medium text-gray-200 ml-2 cursor-pointer">
              Use only custom words
            </label>
            <input
              type="checkbox"
              id="custom-words-only"
              className="ml-1 p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
              disabled={!isOwner}
              checked={gameSettings.onlyCustomWords}
              onChange={() => handleSettingChange(SettingValue.onlyCustomWords, !gameSettings.onlyCustomWords, true)}
            />
          </div>
        </div>

        <textarea
          name="words-input"
          className="w-full border rounded-lg p-2 outline-none"
          placeholder="Type words separated by commas, maximum 2000 characters"
          value={customWords}
          onChange={(e) => setCustomWords(e.target.value)}
          disabled={!isOwner}
          maxLength={2000}
          rows={5}
        />
      </div>

      <div className="sm:mt-2 flex gap-5 justify-end">
        <Button onClick={handleStart} className="w-3/5" disabled={!isOwner} variant="success">
          Start
        </Button>
        <RoomLink />
      </div>
    </div>
  );
}