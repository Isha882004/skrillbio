"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEvent = exports.Languages = exports.SettingValue = exports.RounEndReason = exports.RoomState = exports.PlayerAppearance = void 0;
var PlayerAppearance;
(function (PlayerAppearance) {
    PlayerAppearance[PlayerAppearance["BODY"] = 0] = "BODY";
    PlayerAppearance[PlayerAppearance["EYES"] = 1] = "EYES";
    PlayerAppearance[PlayerAppearance["MOUTH"] = 2] = "MOUTH";
})(PlayerAppearance || (exports.PlayerAppearance = PlayerAppearance = {}));
var RoomState;
(function (RoomState) {
    RoomState["NOT_STARTED"] = "NOT_STARTED";
    RoomState["PLAYER_CHOOSE_WORD"] = "PLAYER_CHOOSE_WORD";
    RoomState["CHOOSING_WORD"] = "CHOOSING_WORD";
    RoomState["DRAWING"] = "DRAWING";
    RoomState["GUESSED"] = "GUESSED";
    RoomState["TIMEUP"] = "TIMEUP";
    RoomState["WINNER"] = "WINNER";
})(RoomState || (exports.RoomState = RoomState = {}));
var RounEndReason;
(function (RounEndReason) {
    RounEndReason[RounEndReason["ALL_GUESSED"] = 1] = "ALL_GUESSED";
    RounEndReason[RounEndReason["TIMEUP"] = 2] = "TIMEUP";
    RounEndReason[RounEndReason["LEFT"] = 3] = "LEFT";
})(RounEndReason || (exports.RounEndReason = RounEndReason = {}));
var SettingValue;
(function (SettingValue) {
    SettingValue["players"] = "players";
    SettingValue["drawTime"] = "drawTime";
    SettingValue["rounds"] = "rounds";
    SettingValue["onlyCustomWords"] = "onlyCustomWords";
    SettingValue["customWords"] = "customWords";
    SettingValue["language"] = "language";
    SettingValue["wordCount"] = "wordCount";
    SettingValue["hints"] = "hints";
})(SettingValue || (exports.SettingValue = SettingValue = {}));
var Languages;
(function (Languages) {
    Languages["en"] = "English";
    Languages["es"] = "Spanish";
    Languages["fr"] = "French";
    Languages["de"] = "German";
    Languages["it"] = "Italian";
    Languages["nl"] = "Dutch";
    Languages["pt"] = "Portuguese";
    Languages["ru"] = "Russian";
    Languages["tr"] = "Turkish";
    Languages["zh"] = "Chinese";
})(Languages || (exports.Languages = Languages = {}));
var GameEvent;
(function (GameEvent) {
    // CLient Events
    GameEvent["CONNECT"] = "connect";
    GameEvent["DISCONNECT"] = "disconnecting";
    GameEvent["JOIN_ROOM"] = "joinRoom";
    GameEvent["LEAVE_ROOM"] = "leaveRoom";
    GameEvent["START_GAME"] = "startGame";
    GameEvent["DRAW"] = "draw";
    GameEvent["DRAW_CLEAR"] = "clear";
    GameEvent["DRAW_UNDO"] = "undo";
    GameEvent["GUESS"] = "guess";
    GameEvent["CHANGE_SETTIING"] = "changeSettings";
    GameEvent["WORD_SELECT"] = "wordSelect";
    GameEvent["VOTE_KICK"] = "voteKick";
    // Server Events
    GameEvent["JOINED_ROOM"] = "joinedRoom";
    GameEvent["PLAYER_JOINED"] = "playerJoined";
    GameEvent["PLAYER_LEFT"] = "playerLeft";
    GameEvent["GAME_STARTED"] = "gameStarted";
    GameEvent["GAME_ENDED"] = "gameEnded";
    GameEvent["DRAW_DATA"] = "drawData";
    GameEvent["CLEAR_DRAW"] = "clearDraw";
    GameEvent["UNDO_DRAW"] = "undoDraw";
    GameEvent["GUESSED"] = "guessed";
    GameEvent["TURN_END"] = "turnEnded";
    GameEvent["CHOOSE_WORD"] = "chooseWord";
    GameEvent["CHOOSING_WORD"] = "choosingWord";
    GameEvent["WORD_CHOSEN"] = "wordChosen";
    GameEvent["GUESS_WORD_CHOSEN"] = "guessWordChosen";
    GameEvent["SETTINGS_CHANGED"] = "settingsChanged";
    GameEvent["GUESS_FAIL"] = "guessFail";
    GameEvent["GUESS_HINT"] = "guessHint";
    GameEvent["GAME_STATE"] = "gameState";
    GameEvent["KICKING_VOTE"] = "kickVote";
    GameEvent["KICKED"] = "kicked";
})(GameEvent || (exports.GameEvent = GameEvent = {}));
