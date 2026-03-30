"use strict";

const fs = require("fs");
const path = require("path");

// ✅ Works in both dev and production
const WORDS_DIR = path.join(__dirname, "../../../words");
const CUSTOM_WORDS_WEIGHT = 3;

// Cache words in memory
const wordsCache = {};

// Load words for a language
function loadWords(language) {
  return new Promise((resolve) => {
    if (wordsCache[language]) {
      return resolve(wordsCache[language]);
    }

    const filePath = path.join(WORDS_DIR, `en.txt`);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`❌ Word file error (${language}):`, err.message);

        // ✅ Fallback words (prevents crash)
        const fallback = ["apple", "dog", "car", "house", "tree"];
        wordsCache[language] = fallback;

        return resolve(fallback);
      }

      const words = data
        .split("\n")
        .map((word) => word.trim())
        .filter(Boolean);

      if (words.length === 0) {
        console.warn(`⚠️ No words found in ${filePath}`);

        const fallback = ["apple", "dog", "car"];
        wordsCache[language] = fallback;

        return resolve(fallback);
      }

      wordsCache[language] = words;
      resolve(words);
    });
  });
}

// Get random words
async function getRandomWords(
  n = 1,
  language,
  onlyCustomWords = false,
  customWords = []
) {
  let words = [];

  if (onlyCustomWords) {
    if (customWords.length < n) {
      throw new Error("Not enough custom words provided");
    }
    words = customWords;
  } else {
    const loadedWords = await loadWords(language);

    words = [
      ...loadedWords,
      ...Array(CUSTOM_WORDS_WEIGHT).fill(customWords || []).flat(),
    ];

    if (words.length < n) {
      throw new Error(`Not enough words available in ${language}`);
    }
  }

  // Shuffle
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }

  return words.slice(0, n);
}

// Convert phrase to underscores
function convertToUnderscores(phrase) {
  return phrase.split(" ").map((word) => word.length);
}

module.exports = {
  getRandomWords,
  convertToUnderscores,
};