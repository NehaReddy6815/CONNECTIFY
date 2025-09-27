// routes/comments.js
const router = require("express").Router();
const Comment = require("../models/comment");

// Add a comment
router.post("/", async (req, res) => {
  const { postId, userId, text } = req.body;
  if (!text || !postId || !userId) return res.status(400).json({ message: "All fields required" });
  try {
    const newComment = await Comment.create({ postId, userId, text });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment" });
  }
});

// Get comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate("userId", "name profilePicture");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" });
  }
});

module.exports = router;
