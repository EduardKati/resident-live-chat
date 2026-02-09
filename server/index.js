const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors({ origin: true, credentials: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"], credentials: true }
});

// In-memory messages (optional)
const messages = [];
const MAX = 50;

io.on("connection", (socket) => {
  socket.emit("chat:init", messages);

  socket.on("chat:message", (payload) => {
    const username = String(payload?.username || "").trim();
    const message = String(payload?.message || "").trim();
    if (!username || !message) return;

    const msg = { username, message, ts: Date.now() };

    messages.push(msg);
    if (messages.length > MAX) messages.shift();

    io.emit("chat:message", msg);
  });
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));