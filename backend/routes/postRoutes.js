// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");


// Get posts by a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture");

    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get posts from people you follow
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const currentUserId = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // If following no one, return empty array
    if (!currentUser.following || currentUser.following.length === 0) {
      return res.json([]);
    }

    const posts = await Post.find({ userId: { $in: currentUser.following } })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture");

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike a post
router.put("/:id/like", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const currentUserId = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(currentUserId)) {
      // If already liked, unlike
      post.likes = post.likes.filter((id) => id.toString() !== currentUserId);
    } else {
      post.likes.push(currentUserId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a post
router.post("/:id/comment", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const currentUserId = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      userId: currentUserId,
      text: req.body.text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    res.json(comment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
