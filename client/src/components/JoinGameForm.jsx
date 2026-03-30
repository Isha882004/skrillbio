import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Languages } from "../types";
import Button from "./ui/Button";
import PlayerSelector from "./Player/PlayerSelector";

export default function JoinGameForm() {
  const [playerData, setPlayerData] = useState({
    name: localStorage.getItem("name") || "",
    appearance: [0, 0, 0],
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || Languages.en
  );

  const [roomId, setRoomId] = useState(null);
  const [error, setError] = useState("");

 useEffect(() => {
  // Query param
  const queryParams = new URLSearchParams(window.location.search);
  const roomIdFromUrl = queryParams.get("roomId");
  if (roomIdFromUrl) setRoomId(roomIdFromUrl);

  // Socket debug
  socket.on("connect", () => console.log("Socket connected"));
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
  socket.on("connect_error", (err) => console.log("Socket connection error:", err));
  socket.on("error", (err) => {
    console.log("Server error:", err);
    setError(err);
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("error");
  };
}, []);

  const handleJoin = (isPrivate = false) => {
    if (playerData.name.trim() === "") {
      alert("Please enter your name");
      return;
    }

    localStorage.setItem("name", playerData.name);
    localStorage.setItem("language", language);

    if (!socket.connected) socket.connect();

    socket.emit(
      GameEvent.JOIN_ROOM,
      playerData,
      language,
      roomId ?? undefined,
      isPrivate
    );
    setTimeout(() => {
  socket.emit(GameEvent.START_GAME, { words: [] });
}, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <span className="p-5 text-red-500">{error}</span>

      <div className="bg-primary-500 p-6 rounded-2xl shadow-lg text-center">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            name="name"
            value={playerData.name}
            onChange={(e) =>
              setPlayerData({ ...playerData, name: e.target.value })
            }
            placeholder="Enter your name"
            className="flex-1 p-2 text-lg border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
          />

          <select
            className="p-2 text-lg border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {Object.entries(Languages).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <PlayerSelector />

        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={() => handleJoin(false)}
        >
          Play!
        </Button>

        <Button
          variant="info"
          size="lg"
          fullWidth
          className="mt-3"
          onClick={() => handleJoin(true)}
        >
          Create Private Room
        </Button>
      </div>
    </div>
  );
}