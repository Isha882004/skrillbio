"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socketHandlers_1 = require("./socket/socketHandlers");
const commandline_1 = require("./utils/commandline");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)());
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
(0, socketHandlers_1.setupSocket)(io);
(0, commandline_1.setupCommandLine)(io);
server.listen(8000, function () {
    console.log("listening on *:8000");
});
