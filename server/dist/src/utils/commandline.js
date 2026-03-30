"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommandLine = setupCommandLine;
const readline_1 = __importDefault(require("readline"));
const redis_1 = require("./redis");
function setupCommandLine(io) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.on("line", (input) => {
        const args = input.trim().split(" ");
        const command = args[0];
        switch (command) {
            case "broadcast":
                const message = args.slice(1).join(" ");
                io.emit("message", message);
                console.log(`Broadcasted message: ${message}`);
                break;
            case "stats":
                console.log(`Connected Clients: ${io.engine.clientsCount}`);
                break;
            case "clear":
                (0, redis_1.deletePublicRooms)();
                break;
            case "exit":
                console.log("Shutting down server...");
                process.exit(0);
            default:
                console.log("Unknown command");
        }
    });
}
