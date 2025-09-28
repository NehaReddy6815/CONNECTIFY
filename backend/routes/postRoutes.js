const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// ----------------------
// Create a new post
// ----------------------
router.post("/", async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.body.userId, // logged-in user's ID
      text: req.body.text || "", // post content
      image: req.body.image || "", // optional image
    });
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Get all posts
// ----------------------
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // latest first
      .populate("userId", "username email"); // populate username & email
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Get posts by a specific user
// ----------------------
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username email"); // populate username & email
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Delete a post by ID (optional for Profile.jsx)
// ----------------------
router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
