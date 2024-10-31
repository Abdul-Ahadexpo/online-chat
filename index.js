// Container function for server setup
function initializeServer() {
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

    // Send the current users in the "General" room
    const roomUsers = Object.values(users).filter(
      (user) => user.room === "General"
    );
    io.to("General").emit("update online users", roomUsers);

    // Listen for user joining a room
    socket.on("join room", (room, username = "") => {
      if (!username) {
        username = `User ${userCounter++}`;
      }
      users[socket.id] = { username, room };
      socket.join(room);
      console.log(`${username} joined room: ${room}`);

      // Notify everyone about all users on the site with their room names
      io.emit("update online users", Object.values(users));

      const roomUsers = Object.values(users).filter(
        (user) => user.room === room
      );
      io.to(room).emit("update online users", roomUsers);
    });

    // Listen for user leaving a room
    socket.on("leave room", (room) => {
      const username = users[socket.id]?.username || `User ${userCounter++}`;
      delete users[socket.id];
      socket.leave(room);
      console.log(`${username} left room: ${room}`);

      // Notify everyone about all users on the site with their room names
      io.emit("update online users", Object.values(users));
    });

    // Listen for chat messages
    socket.on("chat message", (data) => {
      io.to(data.room).emit("chat message", data);
    });

    // Listen for file messages
    socket.on("file message", (data) => {
      io.to(data.room).emit("chat message", data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const { room } = users[socket.id] || {};
      const username = users[socket.id]?.username || `User ${userCounter++}`;
      delete users[socket.id];

      if (room) {
        // Notify everyone about all users on the site with their room names
        io.emit("update online users", Object.values(users));
      }
      console.log(`${username} disconnected`);
    });
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Invoke the container function to initialize the server
initializeServer();
