const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");


const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Enable CORS for frontend
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Add both localhost and 127.0.0.1
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


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

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const commentRoutes = require("./routes/commentsRoutes");
app.use("/api/comments", commentRoutes);


// Error handler (must be after routes)
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Connectify backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
