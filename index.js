const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static("public"));
app.use(express.json({ limit: "10mb" })); // Increase limit for JSON body parsing
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Increase limit for URL-encoded form data

// Track users and their current room
const users = {};
let userCounter = 1; // Initialize a counter for default usernames

io.on("connection", (socket) => {
  console.log("A user connected");

  // Join the default room
  socket.join("General");

  // Listen for user joining a room
  socket.on("join room", (room, username = "") => {
    // Assign a unique default username if none is provided
    if (!username) {
      username = `User ${userCounter++}`;
    }

    users[socket.id] = { username, room };
    socket.join(room);
    console.log(`${username} joined room: ${room}`);

    // Notify everyone in the room about the online users
    const roomUsers = Object.values(users).filter((user) => user.room === room);
    const totalUsers = roomUsers.length; // Get total users in the room
    io.to(room).emit("update online users", totalUsers); // Emit the total user count
  });

  // Listen for user leaving a room
  socket.on("leave room", (room) => {
    const username = users[socket.id]?.username || `User ${userCounter++}`;
    delete users[socket.id];
    socket.leave(room);
    console.log(`${username} left room: ${room}`);

    // Update the room's user list
    const roomUsers = Object.values(users).filter((user) => user.room === room);
    const totalUsers = roomUsers.length; // Get total users in the room
    io.to(room).emit("update online users", totalUsers); // Emit the total user count
  });

  // Listen for chat messages
  socket.on("chat message", (data) => {
    // Broadcast message and sender's name to clients in the same room
    io.to(data.room).emit("chat message", data);
  });

  // Listen for file messages
  socket.on("file message", (data) => {
    io.to(data.room).emit("chat message", data); // Broadcast the file to others in the room
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const { room } = users[socket.id] || {};
    const username = users[socket.id]?.username || `User ${userCounter++}`;
    delete users[socket.id];

    if (room) {
      const roomUsers = Object.values(users).filter(
        (user) => user.room === room
      );
      const totalUsers = roomUsers.length; // Get total users in the room
      io.to(room).emit("update online users", totalUsers); // Emit the total user count
    }

    console.log(`${username} disconnected`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
