const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// Helper to decode token
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).id;
  } catch {
    return null;
  }
};

// Get posts from people you follow
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if (!currentUser.following || currentUser.following.length === 0) {
      return res.json([]);
    }

    const posts = await Post.find({ userId: { $in: currentUser.following } })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture")
      .populate("comments.userId", "username profilePicture");

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get posts by a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture")
      .populate("comments.userId", "username profilePicture");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike a post
router.put("/:id/like", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(currentUserId)) {
      post.likes = post.likes.filter((id) => id.toString() !== currentUserId);
    } else {
      post.likes.push(currentUserId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post("/:id/comment", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { userId: currentUserId, text: req.body.text };
    post.comments.push(comment);
    await post.save();

    // Populate userId for response
    const populatedPost = await Post.findById(post._id).populate("comments.userId", "username profilePicture");
    res.json(populatedPost.comments[populatedPost.comments.length - 1]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
