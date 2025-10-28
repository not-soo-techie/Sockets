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
  socket.on("userId", (userId) => {
    users[userId] = socket.id;
    console.log("user array:", users);
  });

  // Private messaging
  socket.on("private msg", ({ to, msg, from }) => {
    const user = users[to];
    io.to(user).emit("private msg", `User ${from} sent: ${msg}`);
  })


  // Group joining
  socket.on("join room", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
  });

  // Group message
  socket.on("group msg", ({ roomName, msg, from }) => {
    io.to(roomName).emit("group msg", `User ${from} in room ${roomName} sent: ${msg}`);
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