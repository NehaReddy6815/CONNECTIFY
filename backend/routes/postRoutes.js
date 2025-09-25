const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const authMiddleware = require("../middleware/authMiddleware"); // verify JWT

// ------------------------
// Create a new post
// ------------------------
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Post text is required" });
    }

    // Use userId from token (req.user.id)
    const post = new Post({
      userId: req.user.id,
      text,
      image: image || "",
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Get all posts by a specific user
// ------------------------
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Optional: Get all posts (feed)
// ------------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("userId", "name");
    res.json(posts);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
