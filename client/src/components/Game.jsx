import React from "react";
import PlayerScores from "./PlayerScores";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import GameHeader from "./Header";
import useIsMobile from "../hooks/userMobile";
import OverlayContent from "./OverlayContent";
import AudioManager from "./Audio/AudioManager";
import GuessInput from "./GuessInput";
import { MessagesProvider } from "../context/MessagesContext";
import ToastStack from "./Overlay/ToastMessage";
import Logo from "./Logo";
import { useRoom } from "../context/RoomContext";
import { RoomState } from "../types";
const Game = ({ room }) => {
  const isMobile = useIsMobile();
     const { players, roomState } = useRoom();
  return (
    <MessagesProvider>
      <Logo />
      <GameHeader />
      <div className="flex flex-grow flex-col sm:flex-row justify-center w-full h-screen">
        <AudioManager />
        <div className="flex-col">{!isMobile && <PlayerScores />}</div>
        <div>
          <div className="relative overflow-hidden h-full">
            <GameCanvas room={room} />
{roomState === RoomState.WINNER && players.length > 0 && (
  <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-6 py-3 shadow-lg border rounded">
    🏆 Winner: {players.reduce((a, b) => (a.score > b.score ? a : b)).name}
  </div>
)}
            <OverlayContent />
            <ToastStack />
          </div>
        </div>
        <div className="flex-col">
          <GuessInput />
          <div className="flex">
            {isMobile && <PlayerScores />}
            <Chat />
          </div>
        </div>
      </div>
    </MessagesProvider>
    
  );
};

export default Game;