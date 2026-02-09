const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// Allow dev clients (Angular) to connect. In production you’ll tighten this.
app.use(cors({ origin: true, credentials: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"], credentials: true },
});

// In-memory messages (optional, but nice UX). Not persisted.
const messages = [];
const MAX = 50;

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  // Send last messages to newly connected user (optional)
  socket.emit("chat:init", messages);

  // "User joined" notification (bonus)
  socket.on("user:join", (payload) => {
    const username = String(payload?.username || "").trim();
    if (!username) return;

    socket.data.username = username;

    io.emit("chat:system", {
      kind: "system",
      text: `${username} joined`,
      ts: Date.now(),
    });
  });

  // Chat message broadcast
  socket.on("chat:message", (payload) => {
    const username = String(payload?.username || "").trim();
    const message = String(payload?.message || "").trim();
    if (!username || !message) return;

    const msg = { kind: "chat", username, text: message, ts: Date.now() };

    messages.push(msg);
    if (messages.length > MAX) messages.shift();

    io.emit("chat:message", msg);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
    // Optional: emit "left" message
    // const username = socket.data.username;
    // if (username) {
    //   io.emit("chat:system", { kind: "system", text: `${username} left`, ts: Date.now() });
    // }
  });
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
