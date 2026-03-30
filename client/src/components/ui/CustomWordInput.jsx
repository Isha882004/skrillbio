import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CustomWordsInput({ words = [], setWords }) {
  const [input, setInput] = useState("");

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const newWord = input.trim().replace(/,$/, "");
      if (newWord && !words.includes(newWord)) {
        setWords([...words, newWord]);
        setInput("");
      }
    }
  };

  const removeWord = (index) => {
    setWords(words.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence>
          {(words || []).map((word, index) => (
            <motion.div
              key={`${word}-${index}`} // unique key to avoid animation errors
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center space-x-2"
            >
              <span>{word}</span>
              <button
                className="text-red-500 font-bold hover:text-red-700"
                onClick={() => removeWord(index)}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <textarea
        className="w-full border rounded-lg p-2 outline-none"
        placeholder="Type a word and press ',' or Enter"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={2}
      />
    </div>
  );
}

