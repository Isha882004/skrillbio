import React, { useEffect, useState } from "react";
import { GameEvent } from "./types";
import { socket } from "./socketHandler";
import JoinGameForm from "./components/JoinGameForm";
import Game from "./components/Game";
import { RoomProvider } from "./context/RoomContext";

const Home = () => {
  const [room, setRoom] = useState(null);

  function handleRoomJoin(roomData) {
    console.log("Message");
    setRoom(roomData);
  }

  useEffect(() => {
    function handleKicked() {
      setRoom(null);
      socket.disconnect();
    }

    socket.on(GameEvent.JOINED_ROOM, handleRoomJoin);
    socket.on(GameEvent.KICKED, handleKicked);

    return () => {
      socket.off(GameEvent.JOINED_ROOM, handleRoomJoin);
      socket.off(GameEvent.KICKED, handleKicked);
    };
  }, []);

  return (
    <div className="">
      <RoomProvider>
        {room ? <Game room={room} /> : <JoinGameForm />}
      </RoomProvider>
    </div>
  );
};

export default Home;