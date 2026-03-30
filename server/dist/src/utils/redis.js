"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getRedisRoom = getRedisRoom;
exports.setRedisRoom = setRedisRoom;
exports.deleteRedisRoom = deleteRedisRoom;
exports.getPublicRoom = getPublicRoom;
exports.getPublicRooms = getPublicRooms;
exports.deletePublicRooms = deletePublicRooms;
const redis = __importStar(require("redis"));
const types_1 = require("../types");
const dotenv_1 = require("dotenv");
const child_process_1 = require("child_process");
(0, dotenv_1.configDotenv)();
const client = redis.createClient({
    url: process.env.REDDIS_URL,
});
client.on("error", (err) => {
    console.error("Redis error:", err);
    if (err.code === "ECONNREFUSED") {
        // Start a docker contianer of redis
        // startRedisContainer();
    }
});
client.connect().then(() => {
    console.log("Connect to redis");
});
const startRedisContainer = () => {
    (0, child_process_1.exec)("docker run -d redis", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting Redis container: ${error.message}`);
            process.exit(1);
        }
        if (stderr) {
            console.error(`Redis container stderr: ${stderr}`);
        }
        console.log(`Redis container started: ${stdout}`);
    });
};
const ROOM_PREFIX = "room:";
const PUBLIC_ROOM_PREFIX = "publicRoom:";
function getRedisRoom(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield client.get(`${ROOM_PREFIX}${roomId}`);
        if (!data)
            data = yield client.get(`${PUBLIC_ROOM_PREFIX}${roomId}`);
        return data ? JSON.parse(data) : null;
    });
}
function setRedisRoom(roomId, roomData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (roomData.isPrivate) {
            yield client.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(roomData));
        }
        else {
            yield client.set(`${PUBLIC_ROOM_PREFIX}${roomId}`, JSON.stringify(roomData));
        }
    });
}
function deleteRedisRoom(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.del(`${PUBLIC_ROOM_PREFIX}${roomId}`);
        yield client.del(`${ROOM_PREFIX}${roomId}`);
    });
}
function getPublicRoom() {
    return __awaiter(this, arguments, void 0, function* (language = types_1.Languages.en) {
        const rooms = yield getPublicRooms();
        if (rooms.length <= 0) {
            return null;
        }
        for (const roomId of rooms) {
            const room = yield getRedisRoom(roomId);
            if (!room)
                continue;
            if (room.players.length < room.settings.players &&
                room.settings.language === language) {
                return room;
            }
        }
        return null;
    });
}
function getPublicRooms() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield client.keys(`${PUBLIC_ROOM_PREFIX}*`);
        if (!data)
            return [];
        return data.map((e) => e.replace(PUBLIC_ROOM_PREFIX, ""));
    });
}
function deletePublicRooms() {
    return __awaiter(this, void 0, void 0, function* () {
        const publicRooms = yield client.keys(`${PUBLIC_ROOM_PREFIX}*`);
        if (publicRooms.length > 0) {
            yield client.del([...publicRooms]);
            console.log(`Deleted ${publicRooms.length} public rooms`);
        }
        else {
            console.log("No public rooms to delete");
        }
    });
}
