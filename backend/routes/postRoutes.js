const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Create a post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post({
      user: req.body.userId, // pass logged-in user’s ID
      content: req.body.content,
    });
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "name"); // populate username
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
