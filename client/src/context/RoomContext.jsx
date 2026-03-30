import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, RoomState, SettingValue, Languages } from "../types";
// import{RoomContext} from "./RoomContext";

// Create context
const RoomContext = createContext(null);

// Custom hook to use room context
// eslint-disable-next-line react-refresh/only-export-components
export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) 
    throw new Error("useRoom must be used within a RoomProvider");
  
  return context;
};

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState({
    roomId: "",
    creator: "",
    players: [],
    gameState: {
      currentRound: 0,
      drawingData: [],
      guessedWords: [],
      word: "",
      currentPlayer: 0,
      roomState: RoomState.NOT_STARTED,
      timerStartedAt: new Date(),
      hintLetters: [],
    },
    settings: {
      players: 0,
      drawTime: 0,
      rounds: 0,
      onlyCustomWords: false,
      customWords: [],
      wordCount: 0,
      hints: 0,
      language: Languages.en,
    },
    isPrivate: false,
  });

  const [myTurn, setMyTurn] = useState(false);
  const [me, setMe] = useState(null);
  const [roomState, setRoomState] = useState(RoomState.NOT_STARTED);
  const [mutedPlayers, setMutedPlayers] = useState([]);

  // Add / remove player
  const addPlayer = (player) => {
    setRoom((prev) => ({
      ...prev,
      players: [...prev.players, player],
    }));
  };

  const removePlayer = (player) => {
    setRoom((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.playerId !== player.playerId),
    }));
  };

  // Set turn
  // eslint-disable-next-line react-hooks/exhaustive-deps
 const setTurn = (roomData) => {
  // ✅ FULL replace (IMPORTANT)
  setRoom(roomData);

  const current =
    roomData.players[roomData.gameState.currentPlayer] || null;

  setMyTurn(current?.playerId === socket.id);
  setRoomState(roomData.gameState.roomState);
};
  // Update room info
  const joinedRoom = (roomData) => {
    setRoom(roomData);
    setMe(roomData.players.find((p) => p.playerId === socket.id) || null);
  };

  // Change room settings
  const changeSetting = (setting, value) => {
    const settings = { ...room.settings };
    switch (setting) {
      case SettingValue.players:
        settings.players = parseInt(value);
        break;
      case SettingValue.drawTime:
        settings.drawTime = parseInt(value);
        break;
      case SettingValue.rounds:
        settings.rounds = parseInt(value);
        break;
      default:
        break;
    }
    setRoom({ ...room, settings });
  };

const wordChosen = (data) => {
  setRoom((prev) => {
    const current =
      prev.players[prev.gameState.currentPlayer] || null;

    setMyTurn(current?.playerId === socket.id);

    return {
      ...prev,
      gameState: {
        ...prev.gameState,
        roomState: RoomState.DRAWING,
        word: data?.word || prev.gameState.word,
      },
    };
  });

  setRoomState(RoomState.DRAWING);
};

  const choseWord = () => {
    setRoomState(RoomState.PLAYER_CHOOSE_WORD);
  };

  const choosingWord = () => {
    setRoomState(RoomState.CHOOSING_WORD);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
 const gameStarted = (roomData) => {
  const current = roomData.players[roomData.gameState.currentPlayer] || null;
  setMyTurn(current?.playerId === socket.id);

  setRoomState(roomData.gameState.roomState); // ✅ ADD THIS
  joinedRoom(roomData);
};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 const gameEnded = ({ room: roomData, time }) => {
  setRoomState(RoomState.WINNER);

  // ✅ Find winner
  const winner = roomData.players.reduce((prev, curr) =>
    curr.score > prev.score ? curr : prev
  );

  console.log("🏆 Winner:", winner.name);

  setTimeout(() => setRoomState(RoomState.NOT_STARTED), time * 1000);

  joinedRoom(roomData);
};

  const updateGameState = ({ gameState }) => {
    setRoom((prev) => ({ ...prev, gameState }));
    setRoomState(gameState.roomState);
  };

  // Mute / unmute players
  const mutePlayer = (playerId) => {
    setMutedPlayers((prev) => [...prev, playerId]);
  };

  const removeMute = (playerId) => {
    setMutedPlayers((prev) => prev.filter((id) => id !== playerId));
  };

  // Socket listeners
  useEffect(() => {
    socket.on(GameEvent.JOINED_ROOM, joinedRoom);
    socket.on(GameEvent.WORD_CHOSEN, wordChosen);
    socket.on(GameEvent.TURN_END, setTurn);
    socket.on(GameEvent.GAME_STARTED, gameStarted);
    socket.on(GameEvent.GAME_ENDED, gameEnded);
    socket.on(GameEvent.PLAYER_JOINED, addPlayer);
    socket.on(GameEvent.PLAYER_LEFT, removePlayer);
    socket.on(GameEvent.CHOOSE_WORD, choseWord);
   socket.on(GameEvent.GUESS_WORD_CHOSEN, (data) => {
  setRoom((prev) => ({
    ...prev,
    gameState: {
      ...prev.gameState,
      word: data.word, // underscores
      roomState: RoomState.DRAWING,
    },
  }));

  setRoomState(RoomState.DRAWING);
});
    socket.on(GameEvent.CHOOSING_WORD, choosingWord);
    socket.on(GameEvent.GAME_STATE, updateGameState);

    return () => {
      socket.off(GameEvent.JOINED_ROOM, joinedRoom);
      socket.off(GameEvent.GAME_STARTED, gameStarted);
      socket.off(GameEvent.GAME_ENDED, gameEnded);
      socket.off(GameEvent.TURN_END, setTurn);
      socket.off(GameEvent.PLAYER_JOINED, addPlayer);
      socket.off(GameEvent.PLAYER_LEFT, removePlayer);
      socket.off(GameEvent.WORD_CHOSEN, wordChosen);
      socket.off(GameEvent.GUESS_WORD_CHOSEN, wordChosen);
      socket.off(GameEvent.CHOOSE_WORD, choseWord);
      socket.off(GameEvent.CHOOSING_WORD, choosingWord);
      socket.off(GameEvent.GAME_STATE, updateGameState);
    };
  }, [gameEnded,gameStarted,setTurn]); // Empty dependency array - this runs once on mount
useEffect(() => {
  socket.onAny((event, data) => {
    console.log("EVENT:", event, data);
  });
}, []);
  // Safe current player access
  const currentPlayer =
    room.gameState?.currentPlayer !== undefined && 
    room.gameState?.currentPlayer !== null &&
    room.players[room.gameState.currentPlayer]
      ? room.players[room.gameState.currentPlayer]
      : null;

  // Context value
  const contextValue = {
    roomId: room.roomId,
    players: room.players,
    creator: room.creator,
    currentRound: room.gameState.currentRound,
    drawingData: room.gameState.drawingData,
    guessedWords: room.gameState.guessedWords,
    word: room.gameState.word,
    settings: room.settings,
    setRoom,
    currentPlayer,
    changeSetting,
    myTurn,
    me,
    roomState,
    isPrivateRoom: room.isPrivate,
    mutePlayer,
    removeMute,
    mutedPlayers,
  };

  return (
    <RoomContext.Provider value={contextValue}>
      {children}
    </RoomContext.Provider>
  );
};