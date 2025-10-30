const express = require('express');
const { Server } = require("socket.io");
const { createServer } = require('http');
const { join } = require('node:path');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = {}; // { userId: socket.id }

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
    socket.emit("registered", `You are registered as ${userId}`);
  });

  // Private messaging
  socket.on("private_message", ({ to, message, from }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("private_message", { from, message });
    } else {
      socket.emit("error_message", `User ${to} not found or not online.`);
    }
  });

  // Join group room
  socket.on("join_room", (room) => {
    socket.join(room);
    socket.emit("joined_room", `You joined room: ${room}`);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // Group message
  socket.on("group_message", ({ room, from, message }) => {
    io.to(room).emit("group_message", { from, message, room });
  });

  // On disconnect
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
