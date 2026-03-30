import { useEffect, useState } from "react";
import { GameEvent } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

const GameHeader = () => {
  const [word, setWord] = useState("");
  const [interval, startInterval] = useState(null);
  const { settings } = useRoom();
  const [timer, setTimer] = useState(settings.drawTime);
  const [hintLetters, setHintLetters] = useState([]);

  useEffect(() => {
    console.log("Timer", timer);
  }, [timer]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function initTimer({ word, time }) {
    if (interval) clearInterval(interval);

    setTimer(time);

    startInterval(
      setInterval(() => {
        setTimer((e) => (e > 0 ? e - 1 : e));
      }, 1000)
    );

    setWord(word);
    setHintLetters([]);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function initTimerForWord({ time }) {
    if (interval) clearInterval(interval);

    setTimer(time);

    startInterval(
      setInterval(() => {
        setTimer((e) => (e > 0 ? e - 1 : e));
      }, 1000)
    );

    setHintLetters([]);
  }

  function endTurn(_room, data) {
    setWord("");
    setTimer(data.time);
  }

  function hintLetter(data) {
    setHintLetters((e) => [...e, data]);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function gameStateUpdate({ gameState }) {
    if (interval) clearInterval(interval);

    setTimer(gameState.time);

    startInterval(
      setInterval(() => {
        setTimer((e) => (e > 0 ? e - 1 : e));
      }, 1000)
    );

    setWord(gameState.word);
    setHintLetters(gameState.hintLetters ?? []);
  }

  useEffect(() => {
    socket.on(GameEvent.WORD_CHOSEN, initTimer);
    socket.on(GameEvent.GUESS_WORD_CHOSEN, initTimer);
    socket.on(GameEvent.CHOOSE_WORD, initTimerForWord);
    socket.on(GameEvent.CHOOSING_WORD, initTimerForWord);
    socket.on(GameEvent.TURN_END, endTurn);
    socket.on(GameEvent.GUESS_HINT, hintLetter);
    socket.on(GameEvent.GAME_ENDED, endTurn);
    socket.on(GameEvent.GAME_STATE, gameStateUpdate);

    return () => {
      socket.off(GameEvent.WORD_CHOSEN, initTimer);
      socket.off(GameEvent.GUESS_WORD_CHOSEN, initTimer);
      socket.off(GameEvent.CHOOSE_WORD, initTimerForWord);
      socket.off(GameEvent.CHOOSING_WORD, initTimerForWord);
      socket.off(GameEvent.TURN_END, endTurn);
      socket.off(GameEvent.GAME_ENDED, endTurn);
      socket.off(GameEvent.GUESS_HINT, hintLetter);
      socket.off(GameEvent.GAME_STATE, gameStateUpdate);
    };
  }, [gameStateUpdate, initTimer, initTimerForWord, interval]);

  function renderWord() {
    if (typeof word === "string") return <span>{word}</span>;

    let wordIndex = 0;

    return word.map((length, wordPartIndex) => {
      const wordPart = Array.from({ length }, () => {
        const hint = hintLetters.find((e) => e.index === wordIndex);
        const displayChar = hint ? hint.letter : "_";
        wordIndex++;
        
        return (
          <motion.span
            key={wordIndex}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: hint ? 0.1 : 0 }}
            className="inline-block"
          >
            {displayChar}
          </motion.span>
        );
      });

      return (
        <span key={wordPartIndex} className="flex items-center gap-1">
          {wordPartIndex > 0 && <span className="px-1"> </span>}
          {wordPart}
        </span>
      );
    });
  }

  return (
    <div className="mx-auto bg-background-paper rounded-lg text-primary font-bold py-2 px-4 flex items-center justify-between z-50 border-2 border-primary-400 text-center">
      <span className="text-lg font-semibold">{timer}</span>

      <span className="text-xl font-bold self-center flex gap-5 relative select-none">
        <AnimatePresence>{renderWord()}</AnimatePresence>

        <span className="text-xs -left-4 relative flex gap-2">
          {typeof word !== "string" &&
            word.map((n, i) => <span key={i}>{n}</span>)}
        </span>
      </span>
    </div>
  );
};

export default GameHeader;