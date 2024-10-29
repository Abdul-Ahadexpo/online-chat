const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join the default room
  socket.join("General");

  // Listen for room joining
  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle leaving a room
  socket.on("leave room", (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  // Listen for chat messages
  socket.on("chat message", (data) => {
    // Broadcast message and sender's name to clients in the same room
    io.to(data.room).emit("chat message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
