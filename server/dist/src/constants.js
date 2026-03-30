"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GAME_SETTINGS = exports.HINTS_TIME = exports.INITIAL_HINTS_TIME = exports.BONUS_PER_GUESS = exports.DRAWER_POINTS = exports.WINNER_SHOW_TIME = exports.END_ROUND_TIME = exports.WORDCHOOSE_TIME = void 0;
const types_1 = require("./types");
exports.WORDCHOOSE_TIME = 30;
exports.END_ROUND_TIME = 5;
exports.WINNER_SHOW_TIME = 10;
exports.DRAWER_POINTS = 50;
exports.BONUS_PER_GUESS = 10;
exports.INITIAL_HINTS_TIME = 30;
exports.HINTS_TIME = 10;
exports.DEFAULT_GAME_SETTINGS = {
    players: 8,
    rounds: 1,
    drawTime: 60,
    customWords: [],
    onlyCustomWords: false,
    language: types_1.Languages.en,
    wordCount: 3,
    hints: 2,
};
