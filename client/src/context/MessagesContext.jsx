/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState, useCallback } from "react";
import { GameEvent } from "../types";
import { socket } from "../socketHandler";
import { MessageType } from "../components/Chat/Message";
import { useRoom } from "./RoomContext";

// Create context
export const MessagesContext = createContext(undefined);

// Provider component
export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const { currentPlayer, me, myTurn, mutedPlayers } = useRoom();

  // Add a message safely
  const addMessageToChat = useCallback((message, player) => {
    if (!player) return;
    if (player.guessed && player.playerId !== socket.id) return;
    if (mutedPlayers.includes(player.playerId)) return;

    const type = myTurn ? MessageType.GuessClose : MessageType.Guess;

    setMessages((prev) => [
      ...prev,
      { sender: player.name, message, type },
    ]);
  }, [myTurn, mutedPlayers]);

  const addPlayerJoinMessage = useCallback((player) => {
    if (!player) return;
    setMessages((prev) => [
      ...prev,
      { sender: player.name, message: "", type: MessageType.PlayerJoin },
    ]);
  }, []);

  const addPlayerLeftMessage = useCallback((player) => {
    if (!player) return;
    setMessages((prev) => [
      ...prev,
      { sender: player.name, message: "", type: MessageType.PlayerLeft },
    ]);
  }, []);

  const addErrorMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      { sender: "", message, type: MessageType.Error },
    ]);
  }, []);

  const addGuessedMessage = useCallback((player) => {
    if (!player) return;
    setMessages((prev) => [
      ...prev,
      { sender: player.name, message: "has guessed the word", type: MessageType.WordGuessed },
    ]);
  }, []);

  const addWordChosen = useCallback(() => {
    if (!currentPlayer) return;
    setMessages((prev) => [
      ...prev,
      { sender: currentPlayer.name, message: "is now drawing", type: MessageType.WordChoosen },
    ]);
  }, [currentPlayer]);

  const addWordWas = useCallback((_, data) => {
    if (!currentPlayer || !data) return;
    setMessages((prev) => [
      ...prev,
      { sender: "", message: data.word, type: MessageType.WordWas },
    ]);
  }, [currentPlayer]);

  const clearChat = useCallback(() => setMessages([]), []);

  const handleVoteKicking = useCallback(({ voter, player: votee, votes, votesNeeded }) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "",
        message: `${voter} is voting to kick ${votee} (${votes}/${votesNeeded})`,
        type: MessageType.VoteKick,
      },
    ]);
  }, []);

  // Add join message for yourself
  useEffect(() => {
    if (me) addPlayerJoinMessage(me);
  }, [me, addPlayerJoinMessage]);

  // Subscribe to socket events
  useEffect(() => {
    socket.on(GameEvent.GAME_STARTED, clearChat);
    socket.on(GameEvent.GUESS, addMessageToChat);
    socket.on(GameEvent.GUESSED, addGuessedMessage);
    socket.on(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
    socket.on(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
    socket.on(GameEvent.WORD_CHOSEN, addWordChosen);
    socket.on(GameEvent.TURN_END, addWordWas);
    socket.on(GameEvent.KICKING_VOTE, handleVoteKicking);
    socket.on("error", addErrorMessage);

    return () => {
      socket.off(GameEvent.GAME_STARTED, clearChat);
      socket.off(GameEvent.GUESS, addMessageToChat);
      socket.off(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
      socket.off(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
      socket.off(GameEvent.GUESSED, addGuessedMessage);
      socket.off(GameEvent.WORD_CHOSEN, addWordChosen);
      socket.off(GameEvent.TURN_END, addWordWas);
      socket.off(GameEvent.KICKING_VOTE, handleVoteKicking);
      socket.off("error", addErrorMessage);
    };
  }, [
    addMessageToChat,
    addGuessedMessage,
    addPlayerJoinMessage,
    addPlayerLeftMessage,
    addWordChosen,
    addWordWas,
    handleVoteKicking,
    addErrorMessage,
    clearChat,
  ]);

  return (
    <MessagesContext.Provider value={{ messages }}>
      {children}
    </MessagesContext.Provider>
  );
}
export default MessagesContext;