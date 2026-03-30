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
exports.setupSocket = setupSocket;
const redis_1 = require("../utils/redis");
const gameController_1 = require("../game/gameController");
const types_1 = require("../types");
const roomController_1 = require("../game/roomController");
function setupSocket(io) {
    io.on(types_1.GameEvent.CONNECT, (socket) => {
        console.log("A user connected:", socket.id);
        socket.on(types_1.GameEvent.JOIN_ROOM, (playerData_1, ...args_1) => __awaiter(this, [playerData_1, ...args_1], void 0, function* (playerData, language = types_1.Languages.en, roomId, isPrivate) {
            if (!playerData) {
                socket.emit("error", "playerData is required");
                return socket.disconnect();
            }
            if (!roomId) {
                return yield (0, roomController_1.handleNewRoom)(io, socket, playerData, language, isPrivate);
            }
            yield (0, roomController_1.handleNewPlayerJoin)(roomId, socket, io, playerData, language);
        }));
        socket.on(types_1.GameEvent.START_GAME, (_a) => __awaiter(this, [_a], void 0, function* ({ words }) {
            const room = yield (0, gameController_1.getRoomFromSocket)(socket);
            if (!room)
                return;
            if (room.creator != socket.id) {
                return socket.emit("error", "You are not the host");
            }
            else if (room.gameState.currentRound != 0) {
                return socket.emit("error", "Game already started");
            }
            else if (room.players.length < 2) {
                return socket.emit("error", "At least 2 players requred to join game");
            }
            if (words) {
                room.settings.customWords = words;
                yield (0, redis_1.setRedisRoom)(room.roomId, room);
            }
            yield (0, roomController_1.startGame)(room, io);
        }));
        socket.on(types_1.GameEvent.DRAW, (drawData) => __awaiter(this, void 0, void 0, function* () { return (0, roomController_1.handleDrawAction)(socket, "DRAW", drawData); }));
        socket.on(types_1.GameEvent.DRAW_CLEAR, () => __awaiter(this, void 0, void 0, function* () { return (0, roomController_1.handleDrawAction)(socket, "CLEAR"); }));
        socket.on(types_1.GameEvent.DRAW_UNDO, () => __awaiter(this, void 0, void 0, function* () { return (0, roomController_1.handleDrawAction)(socket, "UNDO"); }));
        socket.on(types_1.GameEvent.GUESS, (data) => __awaiter(this, void 0, void 0, function* () {
            const { guess } = data;
            const room = yield (0, gameController_1.getRoomFromSocket)(socket);
            if (!room)
                return;
            yield (0, roomController_1.guessWord)(room.roomId, guess, socket, io);
        }));
        socket.on(types_1.GameEvent.WORD_SELECT, (word) => __awaiter(this, void 0, void 0, function* () {
            const room = yield (0, gameController_1.getRoomFromSocket)(socket);
            if (!room)
                return;
            yield (0, roomController_1.wordSelected)(room.roomId, word, io);
        }));
        socket.on(types_1.GameEvent.CHANGE_SETTIING, (setting, value) => __awaiter(this, void 0, void 0, function* () {
            yield (0, roomController_1.handleSettingsChange)(socket, io, setting, value);
        }));
        socket.on(types_1.GameEvent.DISCONNECT, () => __awaiter(this, void 0, void 0, function* () {
            console.log("User disconnected:", socket.id);
            (0, roomController_1.handlePlayerLeft)(socket, io);
        }));
        socket.on(types_1.GameEvent.VOTE_KICK, (playerId) => {
            (0, roomController_1.handleVoteKick)(socket, io, playerId);
        });
    });
}
