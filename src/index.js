const express = require('express');
const { Server } = require("socket.io");
const { createServer } = require('http');
const { join } = require('node:path');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = {};
console.log(users)

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on("connection", (socket) => {
    // When user registers or logs in
  console.log("A user connected:", socket.id);
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
    console.log(users)
  });
  // Private messaging
  socket.on("private message", (toUser, msg) => {
    const toSocketId = users[toUser];
    if (toSocketId) {
      io.to(toSocketId).emit("private message", socket.id, msg);
      console.log(`Private message from ${socket.id} to ${toUser}: ${msg}`);
      console.log(users)
    } else {
      console.log(`User ${toUser} not found`);

    }
  });
  // Group joining
  socket.on("join room", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);
    console.log(users)
  });
  // Group message
  socket.on("group message", (roomName, msg) => {
    io.to(roomName).emit("group message", socket.id, msg);
    console.log(`Message from ${socket.id} in room ${roomName}: ${msg}`);
    console.log(users)
  });


  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);  
    for (let userId in users) {
      if (users[userId] === socket.id) delete users[userId];
    }
  });
});

server.listen(3005, () => {
  console.log('Server running at http://localhost:3005');
});