"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSettingsChange = exports.handlePlayerLeft = exports.handleNewRoom = void 0;
exports.startGame = startGame;
exports.endRound = endRound;
exports.guessWord = guessWord;
exports.nextRound = nextRound;
exports.wordSelected = wordSelected;
exports.givePoints = givePoints;
exports.endGame = endGame;
exports.handleDrawAction = handleDrawAction;
exports.sendHint = sendHint;
exports.handleNewPlayerJoin = handleNewPlayerJoin;
exports.handleInBetweenJoin = handleInBetweenJoin;
exports.handleVoteKick = handleVoteKick;
const types_1 = require("../types");
const redis_1 = require("../utils/redis");
const types_2 = require("../types");
const word_1 = require("../utils/word");
const gameController_1 = require("./gameController");
const gameController_2 = require("./gameController");
const constants_1 = require("../constants");
const timers = new Map();
const hintTimers = new Map();
// This is for new game on public rooms
const startGameTimers = new Map();
function clearTimers(roomId) {
    const timer = timers.get(roomId);
    const hintTimer = hintTimers.get(roomId);
    if (timer) {
        clearTimeout(timer);
        timers.delete(roomId);
    }
    if (hintTimer) {
        clearTimeout(hintTimer);
        hintTimers.delete(roomId);
    }
}
function startGame(room, io) {
    return __awaiter(this, void 0, void 0, function* () {
        clearTimers(room.roomId);
        room.gameState.currentRound = 1;
        room.gameState.currentPlayer = 0;
        room.gameState.guessedWords = [];
        room.gameState.drawingData = [];
        room.gameState.hintLetters = [];
        (room.gameState.roomState = types_1.RoomState.CHOOSING_WORD),
            yield (0, redis_1.setRedisRoom)(room.roomId, room);
        io.to(room.roomId).emit(types_2.GameEvent.GAME_STARTED, room);
        yield nextRound(room.roomId, io);
        return room;
    });
}
function endRound(roomId_1, io_1) {
    return __awaiter(this, arguments, void 0, function* (roomId, io, reason = types_2.RounEndReason.TIMEUP) {
        let room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        clearTimers(room.roomId);
        if (reason === types_2.RounEndReason.LEFT && room.players.length === 2) {
            return;
        }
        room.gameState.currentPlayer += 1;
        // Check if playerCounter needs to be incremented
        if (room.gameState.currentPlayer >= room.players.length) {
            // Round end
            room.gameState.currentRound += 1;
            room.gameState.currentPlayer = 0;
        }
        yield (0, redis_1.setRedisRoom)(roomId, room);
        yield givePoints(roomId);
        room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        room.gameState.drawingData = [];
        room.players = room.players.map((e) => {
            return Object.assign(Object.assign({}, e), { guessed: false, guessedAt: null });
        });
        yield (0, redis_1.setRedisRoom)(roomId, room);
        io.to(room.roomId).emit(types_2.GameEvent.TURN_END, room, {
            word: room.gameState.word,
            reason,
            time: constants_1.END_ROUND_TIME,
        });
        room.gameState.word = "";
        room.gameState.roomState = types_1.RoomState.CHOOSING_WORD;
        yield (0, redis_1.setRedisRoom)(roomId, room);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if (room.gameState.currentRound > room.settings.rounds) {
                return yield endGame(roomId, io);
            }
            yield nextRound(roomId, io);
        }), constants_1.END_ROUND_TIME * 1000);
    });
}
function guessWord(roomId, guess, socket, io) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        const player = room.players.find((e) => e.playerId === socket.id);
        if (!player)
            return;
        const currentPlayer = room.players[room.gameState.currentPlayer];
        if (player.playerId !== currentPlayer.playerId &&
            room.gameState.word === guess.toLowerCase() &&
            !player.guessed) {
            // Mark player as guessed
            player.guessed = true;
            player.guessedAt = new Date();
            yield (0, redis_1.setRedisRoom)(room.roomId, room);
            io.to(room.roomId).emit(types_2.GameEvent.GUESSED, player);
            // Check if all players (except the current one) have guessed
            if (room.players.every((p) => p.guessed || p.playerId === currentPlayer.playerId)) {
                yield endRound(room.roomId, io, types_2.RounEndReason.ALL_GUESSED);
            }
        }
        else {
            io.to(room.roomId).emit(types_2.GameEvent.GUESS, guess, player);
        }
    });
}
function nextRound(roomId, io) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        // Set the current player
        const currentPlayer = room.players[room.gameState.currentPlayer];
        if (!currentPlayer)
            return;
        // Get random words
        const words = yield (0, word_1.getRandomWords)(room.settings.wordCount, room.settings.language, room.settings.onlyCustomWords, room.settings.customWords);
        // Send words to current player
        io.to(currentPlayer.playerId).emit(types_2.GameEvent.CHOOSE_WORD, {
            words,
            time: constants_1.WORDCHOOSE_TIME,
        });
        // Send choosing word event to other players in the room
        io.to(room.roomId)
            .except(currentPlayer.playerId)
            .emit(types_2.GameEvent.CHOOSING_WORD, { currentPlayer, time: constants_1.WORDCHOOSE_TIME });
        room.gameState.timerStartedAt = new Date();
        yield (0, redis_1.setRedisRoom)(room.roomId, room);
        const timeOut = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const room = yield (0, redis_1.getRedisRoom)(roomId);
            if (!room)
                return;
            if (room.gameState.word != "")
                return;
            // Not selected a word;
            const randomWord = words[Math.floor(Math.random() * words.length)];
            yield wordSelected(roomId, randomWord, io);
        }), constants_1.WORDCHOOSE_TIME * 1000);
        timers.set(roomId, timeOut);
    });
}
function wordSelected(roomId, word, io) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        clearTimers(room.roomId);
        room.gameState.word = word;
        room.gameState.roomState = types_1.RoomState.DRAWING;
        room.gameState.timerStartedAt = new Date();
        yield (0, redis_1.setRedisRoom)(room.roomId, room);
        yield (0, redis_1.setRedisRoom)(roomId, room);
        const player = room.players[room.gameState.currentPlayer];
        if (!player)
            return;
        // Send the selected word to the drawer
        io.to(player.playerId).emit(types_2.GameEvent.WORD_CHOSEN, {
            word,
            time: room.settings.drawTime,
        });
        // convert the word into array of letter lengths
        const words_lens = (0, word_1.convertToUnderscores)(word);
        io.to(room.roomId).except(player.playerId).emit(types_2.GameEvent.GUESS_WORD_CHOSEN, {
            word: words_lens,
            time: room.settings.drawTime,
        });
        const timeOut = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield endRound(roomId, io, types_2.RounEndReason.TIMEUP);
        }), room.settings.drawTime * 1000);
        timers.set(roomId, timeOut);
        if (room.settings.hints > 0) {
            const hintsTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield sendHint(io, roomId);
            }), room.settings.drawTime * 0.5 * 1000);
            hintTimers.set(roomId, hintsTimeout);
        }
    });
}
function givePoints(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        const now = new Date();
        const playersWhoGuessed = room.players.filter((player) => player.guessed);
        if (playersWhoGuessed.length === 0) {
            room.players.forEach((player) => {
                player.score += 0;
            });
            yield (0, redis_1.setRedisRoom)(room.roomId, room);
            return;
        }
        playersWhoGuessed.forEach((player, index) => {
            var _a;
            const points = 200;
            const guessTime = Math.abs((now.getTime() - new Date((_a = player.guessedAt) !== null && _a !== void 0 ? _a : now).getTime()) / 1000);
            player.score += Math.round(Math.max(points - guessTime, 0));
        });
        const currentPlayer = room.players[room.gameState.currentPlayer];
        if (!currentPlayer)
            return;
        currentPlayer.score +=
            constants_1.DRAWER_POINTS + playersWhoGuessed.length * constants_1.BONUS_PER_GUESS;
        yield (0, redis_1.setRedisRoom)(room.roomId, room);
    });
}
function endGame(roomId, io) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        clearTimers(room.roomId);
        room.gameState.currentRound = 0;
        room.gameState.word = "";
        room.gameState.guessedWords = [];
        room.gameState.roomState = types_1.RoomState.NOT_STARTED;
        room.vote_kickers = [];
        yield (0, redis_1.setRedisRoom)(roomId, room);
        io.to(roomId).emit(types_2.GameEvent.GAME_ENDED, { room, time: constants_1.WINNER_SHOW_TIME });
        if (!room.isPrivate) {
            const timeOut = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield startGame(room, io);
            }), constants_1.WINNER_SHOW_TIME * 1000);
            startGameTimers.set(roomId, timeOut);
        }
    });
}
const handleNewRoom = (io, socket, playerData, language, isPrivate) => __awaiter(void 0, void 0, void 0, function* () {
    let roomId;
    if (isPrivate) {
        roomId = yield (0, gameController_1.generateEmptyRoom)(socket, isPrivate, language);
    }
    else {
        const room = yield (0, redis_1.getPublicRoom)(language);
        if (!room) {
            roomId = yield (0, gameController_1.generateEmptyRoom)(socket, false, language);
        }
        else {
            roomId = room.roomId;
        }
    }
    handleNewPlayerJoin(roomId, socket, io, playerData, language);
});
exports.handleNewRoom = handleNewRoom;
function handleDrawAction(socket, action, drawData) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, gameController_2.getRoomFromSocket)(socket);
        if (!room || room.gameState.currentRound === 0)
            return;
        const currentPlayer = room.players[room.gameState.currentPlayer];
        if (!currentPlayer || currentPlayer.playerId !== socket.id)
            return;
        switch (action) {
            case "DRAW":
                if (!drawData)
                    return;
                room.gameState.drawingData.push(drawData);
                socket.to(room.roomId).emit(types_2.GameEvent.DRAW_DATA, drawData);
                break;
            case "CLEAR":
                room.gameState.drawingData = [];
                socket.to(room.roomId).emit(types_2.GameEvent.CLEAR_DRAW);
                break;
            case "UNDO":
                room.gameState.drawingData.pop();
                socket.to(room.roomId).emit(types_2.GameEvent.UNDO_DRAW);
                break;
        }
        yield (0, redis_1.setRedisRoom)(room.roomId, room);
    });
}
const handlePlayerLeft = (socket, io) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, gameController_2.getRoomFromSocket)(socket);
    if (!room)
        return;
    const currentPlayer = room.players[room.gameState.currentPlayer];
    if (currentPlayer && currentPlayer.playerId === socket.id) {
        yield endRound(room.roomId, io, types_2.RounEndReason.LEFT);
    }
    const player = room.players.find((e) => e.playerId === socket.id);
    if (!player)
        return;
    room.players = room.players.filter((e) => e.playerId != socket.id);
    if (room.players.length === 0) {
        yield (0, redis_1.deleteRedisRoom)(room.roomId);
        return;
    }
    if (room.creator === player.playerId &&
        room.players.length > 0 &&
        room.isPrivate) {
        room.creator = room.players[0].playerId;
    }
    yield (0, redis_1.setRedisRoom)(room.roomId, room);
    socket.to(room.roomId).emit(types_2.GameEvent.PLAYER_LEFT, player);
    if (room.players.length === 1 && room.gameState.currentRound >= 1) {
        // No players left in the room
        yield endGame(room.roomId, io);
        // not 2 players present so game will not start
        if (!room.isPrivate) {
            if (startGameTimers.has(room.roomId)) {
                clearTimeout(startGameTimers.get(room.roomId));
                startGameTimers.delete(room.roomId);
            }
        }
    }
    if (room.players.length <= 0) {
        yield (0, redis_1.deleteRedisRoom)(room.roomId);
        clearTimers(room.roomId);
        if (startGameTimers.has(room.roomId)) {
            clearTimeout(startGameTimers.get(room.roomId));
            startGameTimers.delete(room.roomId);
        }
    }
});
exports.handlePlayerLeft = handlePlayerLeft;
const handleSettingsChange = (socket, io, setting, value) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof setting !== "string")
        return;
    const room = yield (0, gameController_2.getRoomFromSocket)(socket);
    if (!room)
        return;
    if (!(setting in room.settings))
        return socket.emit("error", "Invalid setting value");
    const settingType = typeof room.settings[setting];
    if (typeof value !== settingType)
        return socket.emit("error", `Invalid value type for ${setting}`);
    // @ts-ignore
    room.settings[setting] = value;
    yield (0, redis_1.setRedisRoom)(room.roomId, room);
    io.to(room.roomId).emit(types_2.GameEvent.SETTINGS_CHANGED, setting, value);
});
exports.handleSettingsChange = handleSettingsChange;
function sendHint(io, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        const word = room.gameState.word;
        if (!word)
            return;
        if (room.gameState.hintLetters.length >= room.settings.hints)
            return;
        if (hintTimers.get(roomId))
            clearTimeout(hintTimers.get(roomId));
        // Cannot make the whole word appear randomly
        if (room.gameState.hintLetters.length - 1 >= word.length)
            return;
        const revealedIndices = new Set();
        // Reveal some characters based on word length
        while (revealedIndices.size < Math.ceil(word.length / 3)) {
            const index = Math.floor(Math.random() * word.length);
            revealedIndices.add(index);
        }
        // Create an array of revealed letters with indices
        const hintArray = Array.from(revealedIndices).map((index) => ({
            index,
            letter: word[index],
        }));
        // Get a random element from the hint array
        const randomIndex = Math.floor(Math.random() * hintArray.length);
        const hint = hintArray[randomIndex];
        room.gameState.hintLetters.push(hint);
        // Emit hint to the room
        io.to(roomId)
            .except(room.players[room.gameState.currentPlayer].playerId)
            .emit(types_2.GameEvent.GUESS_HINT, hint);
        if (room.gameState.hintLetters.length !== room.settings.hints) {
            hintTimers.set(roomId, setTimeout(sendHint, constants_1.HINTS_TIME * 1000, io, roomId));
        }
    });
}
function handleNewPlayerJoin(roomId, socket, io, playerData, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room) {
            return (0, exports.handleNewRoom)(io, socket, playerData, language, false);
        }
        if (room.players.length >= room.settings.players) {
            socket.emit("error", "The room you're trying to join is full");
            return socket.disconnect();
        }
        const player = Object.assign(Object.assign({}, playerData), { score: 0, playerId: socket.id, guessed: false, guessedAt: null });
        room.players.push(player);
        yield (0, redis_1.setRedisRoom)(roomId, room);
        socket.join(roomId);
        socket.emit(types_2.GameEvent.JOINED_ROOM, room);
        io.to(room.roomId).emit(types_2.GameEvent.PLAYER_JOINED, player);
        if (!room.isPrivate &&
            room.players.length >= 2 &&
            !startGameTimers.has(roomId) &&
            room.gameState.currentRound === 0) {
            yield startGame(room, io);
        }
        if (room.gameState.roomState != types_1.RoomState.NOT_STARTED) {
            handleInBetweenJoin(roomId, socket, io);
        }
    });
}
function handleInBetweenJoin(roomId, socket, io) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield (0, redis_1.getRedisRoom)(roomId);
        if (!room)
            return;
        socket.join(roomId);
        // subtract now from timerStartedAt
        const now = new Date();
        const timeElapsed = now.getTime() - new Date(room.gameState.timerStartedAt).getTime();
        const timeLeft = (room.gameState.roomState === types_1.RoomState.CHOOSING_WORD
            ? constants_1.WORDCHOOSE_TIME
            : room.settings.drawTime) *
            1000 -
            timeElapsed;
        if (timeLeft < 0)
            return;
        const time = Math.round(timeLeft / 1000);
        const gameStateWithoutWord = Object.assign(Object.assign({}, room.gameState), { word: (0, word_1.convertToUnderscores)(room.gameState.word), time });
        socket.emit(types_2.GameEvent.GAME_STATE, { gameState: gameStateWithoutWord });
    });
}
function handleVoteKick(socket, io, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const room = yield (0, gameController_2.getRoomFromSocket)(socket);
        if (!room)
            return;
        const voteKickers = room.vote_kickers;
        const player = room.players.find((e) => e.playerId === playerId);
        if (!player)
            return;
        const voter = room.players.find((e) => e.playerId === socket.id);
        if (!voter)
            return;
        const voteKicker = voteKickers.find((e) => e[0] === playerId);
        if (!voteKicker) {
            voteKickers.push([playerId, [voter.playerId]]);
        }
        else {
            if (voteKicker[1].includes(voter.playerId))
                return;
            voteKicker[1].push(voter.playerId);
        }
        const votesNeeded = Math.ceil(room.players.length / 2);
        const votes = (_b = (_a = voteKickers.find((e) => e[0] === playerId)) === null || _a === void 0 ? void 0 : _a[1].length) !== null && _b !== void 0 ? _b : 0;
        io.to(room.roomId).emit(types_2.GameEvent.KICKING_VOTE, {
            voter: voter.name,
            player: player.name,
            votes,
            votesNeeded,
        });
        if (votes >= votesNeeded) {
            room.players = room.players.filter((e) => e.playerId !== playerId);
            room.vote_kickers = room.vote_kickers.filter((e) => e[0] !== playerId);
            io.to(room.roomId).emit(types_2.GameEvent.PLAYER_LEFT, player);
            io.to(playerId).emit(types_2.GameEvent.KICKED);
            (_c = io.sockets.sockets.get(playerId)) === null || _c === void 0 ? void 0 : _c.leave(room.roomId);
        }
        yield (0, redis_1.setRedisRoom)(room.roomId, room);
    });
}
