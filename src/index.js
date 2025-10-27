const express = require('express');
const { Server } = require("socket.io");
const { createServer } = require('http');
const { join } = require('node:path');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = {};

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When user registers or logs in
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Private messaging
  socket.on("private message", ({ to, message, from }) => {
    const receiverSocket = users[to];
    if (receiverSocket) {
      io.to(receiverSocket).emit("private message", { from, message });
    }
  });

  // Group joining
  socket.on("join room", (roomName) => {
    socket.join(roomName);
    socket.emit("joined", `Joined room: ${roomName}`);
  });

  // Group message
  socket.on("group message", ({ room, message, from }) => {
    io.to(room).emit("group message", { from, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) delete users[userId];
    }
  });
});

server.listen(3005, () => {
  console.log('Server running at http://localhost:3005');
});