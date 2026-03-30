# 🎨 Skribbl.io Clone – Multiplayer Drawing & Guessing Game

## 📌 Overview

This project is a full-stack clone of **skribbl.io**, a real-time multiplayer drawing and guessing game. Players join a room, take turns drawing words, and others guess to earn points. The player with the highest score at the end wins.

---

## 🚀 Live Demo

👉 **Live URL:** 	skibblio.liveblog365.com

---

## 🛠️ Tech Stack

### Frontend

* React + javascript + Vite
* HTML5 Canvas API (drawing)

### Backend

* Node.js + Express

### Real-time Communication

* Socket.IO (WebSockets)

### Database (Optional)

* SQLite / PostgreSQL (for rooms, scores, word list)

---

## ✨ Features

### ✅ Core Features

* Create & join multiplayer rooms (public/private)
* Lobby system with player list
* Turn-based drawing system
* Real-time canvas synchronization
* Word selection (multiple options)
* Guessing via chat
* Scoring & leaderboard
* Game rounds and winner announcement

### 🎨 Drawing Tools

* Brush with colors
* Adjustable brush size
* Undo last stroke
* Clear canvas

### 💬 Chat & Guessing

* Real-time chat
* Guess validation
* Correct guess notification

### ⏱️ Game Flow

* Round timer
* Automatic turn rotation
* Game end summary

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone [https://github.com/Isha882004/skrillbio]
cd your-repo-name
```

---

### 2. Install Dependencies

#### Client

```bash
cd client
npm install
```

#### Server

```bash
cd server
npm install
```

---

### 3. Run Project Locally

#### Start Backend

```bash
cd server
npm start
```

#### Start Frontend

```bash
cd client
npm run dev
```

---

## 🌐 Deployment

### Backend (Render / Railway)

* Connect GitHub repo
* Add build command:

```bash
npm install
```

* Start command:

```bash
node server.js
```

## 🔌 WebSocket Events

### Room & Lobby

* `create_room`
* `join_room`
* `player_joined`
* `start_game`

### Game

* `game_state`
* `round_start`
* `word_chosen`
* `round_end`
* `game_over`

### Drawing

* `draw_start`
* `draw_move`
* `draw_end`
* `canvas_clear`
* `draw_undo`

### Chat

* `guess`
* `chat_message`

---

## 🧠 Architecture Overview

### 🔹 Game Logic

* Managed on server
* Controls:

  * Rounds
  * Turn order
  * Scoring system

### 🔹 Real-time Sync

* Socket.IO used for:

  * Drawing strokes
  * Chat messages
  * Game state updates

### 🔹 Drawing System

* Canvas captures strokes (x, y, color, size)
* Sent via WebSocket
* Rendered on all clients in real-time

---

## 🎯 How It Works

1. Player creates or joins a room
2. Host starts the game
3. One player draws a word
4. Others guess via chat
5. Points awarded for correct guesses
6. Rounds continue until completion
7. Winner is घोषित based on score

---

## 📂 Project Structure

```
root/
│
├── client/        # React frontend
├── server/        # Node.js backend
├── README.md
└── .gitignore
```

---

## 📦 .gitignore (Important)

```
node_modules/
.env
dist/
build/
```

---

## 📈 Future Improvements

* Word categories
* Eraser tool
* Spectator mode
* Replay feature
* Voice chat integration

---
