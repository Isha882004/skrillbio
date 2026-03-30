import { useEffect } from "react";
import { socket } from "../../socketHandler";
import { GameEvent } from "../../types";
import playerGuessAudio from "../../sounds/playerGuess.wav";
import joinAudio from "../../sounds/playerJoin.wav";
import leaveAudio from "../../sounds/playerLeft.wav";

export default function AudioManager() {
  const playerGuess = new Audio(playerGuessAudio);
  const playerJoinAudio = new Audio(joinAudio);
  const playerLeftAudio = new Audio(leaveAudio);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handlePlayerJoin() {
    playerJoinAudio.play();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handlePlayerLeft() {
    playerLeftAudio.play();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handlePlayerGuess() {
    playerGuess.play();
  }

  useEffect(() => {
    socket.on(GameEvent.PLAYER_JOINED, handlePlayerJoin);
    socket.on(GameEvent.PLAYER_LEFT, handlePlayerLeft);
    socket.on(GameEvent.GUESSED, handlePlayerGuess);

    return () => {
      socket.off(GameEvent.PLAYER_JOINED, handlePlayerJoin);
      socket.off(GameEvent.PLAYER_LEFT, handlePlayerLeft);
      socket.off(GameEvent.GUESSED, handlePlayerGuess);
    };
  }, [handlePlayerGuess, handlePlayerJoin, handlePlayerLeft]);

  return null;
}