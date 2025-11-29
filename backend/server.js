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

// Enable CORS for frontend
app.use(
  cors({
    origin: ["http://localhost:5173","https://connectify-socialmediaapp.netlify.app"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

// Test route
app.get("/", (req, res) => {
  res.send("Connectify backend is running!");
});

// ---- SOCKET.IO SETUP ----

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io to server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Import and setup message socket handlers
const setupMessageSocket = require("./socket/messageSocket");
setupMessageSocket(io);

// ---- MONGODB CONNECTION & SERVER START ----
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server with WebSockets running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));