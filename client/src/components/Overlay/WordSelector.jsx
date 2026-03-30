import { socket } from "../../socketHandler";
import { GameEvent } from "../../types";
import Button from "../ui/Button";

export default function WordSelector({ words }) {
  function handleWordSelect(word) {
    socket.emit(GameEvent.WORD_SELECT, word);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {words.map((e) => (
        <Button onClick={() => handleWordSelect(e)} color="" key={e}>
          {e}
        </Button>
      ))}
    </div>
  );
}