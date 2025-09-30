const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Enable CORS for frontend (any localhost port during dev)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Debug Mongo URI
console.log("MONGO_URI:", process.env.MONGO_URI);

// Routes
const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes);

const editProfileRoutes = require("./routes/editProfileRoutes");
app.use("/api/users", editProfileRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

// Error handler (must be after routes)
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Connectify backend is running!");
});

// ---- SOCKET.IO SETUP ----

// Create HTTP server instead of app.listen
const server = http.createServer(app);

// Attach socket.io to server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Join a private room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Send message in room
  socket.on("sendMessage", ({ room, message }) => {
    io.to(room).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});


// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server with WebSockets running on port ${PORT}`)
);
