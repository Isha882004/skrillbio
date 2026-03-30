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
exports.generateRoomId = generateRoomId;
exports.generateEmptyRoom = generateEmptyRoom;
exports.getRoomFromSocket = getRoomFromSocket;
const redis_1 = require("../utils/redis");
const types_1 = require("../types");
const redis_2 = require("../utils/redis");
const constants_1 = require("../constants");
function generateRoomId() {
    return String("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx").replace(/[xy]/g, (character) => {
        const random = (Math.random() * 16) | 0;
        const value = character === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}
function generateEmptyRoom(socket_1) {
    return __awaiter(this, arguments, void 0, function* (socket, isPrivate = false, language = types_1.Languages.en) {
        const roomId = generateRoomId();
        const room = {
            roomId,
            creator: isPrivate ? socket.id : null,
            players: [],
            gameState: {
                currentRound: 0,
                drawingData: [],
                guessedWords: [],
                word: "",
                currentPlayer: 0,
                hintLetters: [],
                roomState: types_1.RoomState.NOT_STARTED,
                timerStartedAt: new Date(),
            },
            settings: Object.assign(Object.assign({}, constants_1.DEFAULT_GAME_SETTINGS), { language }),
            isPrivate,
            vote_kickers: [],
        };
        yield (0, redis_1.setRedisRoom)(roomId, room);
        return roomId;
    });
}
function getRoomFromSocket(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!socket)
            return null;
        const roomId = Array.from(socket.rooms)[1];
        if (!roomId)
            return null;
        const room = yield (0, redis_2.getRedisRoom)(roomId);
        return room;
    });
}
