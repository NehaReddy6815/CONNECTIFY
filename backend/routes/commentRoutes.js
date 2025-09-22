const express = require("express");
const router = express.Router();
const Comment = require("../models/comments");

// GET all comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a comment for a post
router.post("/", async (req, res) => {
  try {
    const { postId, userId, text } = req.body;
    const newComment = new Comment({ postId, userId, text });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
