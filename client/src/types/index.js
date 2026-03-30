// Game Events
export const GameEvent = {
  // Client Events
  CONNECT: "connect",
  DISCONNECT: "disconnecting",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  START_GAME: "startGame",
  DRAW: "draw",
  DRAW_CLEAR: "clear",
  DRAW_UNDO: "undo",
  GUESS: "guess",
  CHANGE_SETTIING: "changeSettings",
  WORD_SELECT: "wordSelect",
  VOTE_KICK: "voteKick",

  // Server Events
  JOINED_ROOM: "joinedRoom",
  PLAYER_JOINED: "playerJoined",
  PLAYER_LEFT: "playerLeft",
  GAME_STARTED: "gameStarted",
  GAME_ENDED: "gameEnded",
  DRAW_DATA: "drawData",
  CLEAR_DRAW: "clearDraw",
  UNDO_DRAW: "undoDraw",
  GUESSED: "guessed",
  TURN_END: "turnEnded",
  CHOOSE_WORD: "chooseWord",
  CHOOSING_WORD: "choosingWord",
  WORD_CHOSEN: "wordChosen",
  GUESS_WORD_CHOSEN: "guessWordChosen",
  SETTINGS_CHANGED: "settingsChanged",
  GUESS_FAIL: "guessFail",
  GUESS_HINT: "guessHint",
  GAME_STATE: "gameState",
  KICKING_VOTE: "kickVote",
  KICKED: "kicked",
};

// Player Appearance
export const PlayerAppearance = {
  BODY: 0,
  EYES: 1,
  MOUTH: 2,
};

// Languages
export const Languages = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  nl: "Dutch",
  pt: "Portuguese",
  ru: "Russian",
  tr: "Turkish",
  zh: "Chinese",
};

// Setting Keys
export const SettingValue = {
  players: "players",
  drawTime: "drawTime",
  rounds: "rounds",
  onlyCustomWords: "onlyCustomWords",
  customWords: "customWords",
  language: "language",
  wordCount: "wordCount",
  hints: "hints",
};

// Room State
export const RoomState = {
  NOT_STARTED: "NOT_STARTED",
  PLAYER_CHOOSE_WORD: "PLAYER_CHOOSE_WORD",
  CHOOSING_WORD: "CHOOSING_WORD",
  DRAWING: "DRAWING",
  GUESSED: "GUESSED",
  TIMEUP: "TIMEUP",
  WINNER: "WINNER",
};

// Round End Reason
export const RounEndReason = {
  ALL_GUESSED: 1,
  TIMEUP: 2,
  LEFT: 3,
};