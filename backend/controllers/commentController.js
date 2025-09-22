const Comment = require("../models/Comment");

// GET comments for a post
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// CREATE a comment
exports.createComment = async (req, res, next) => {
  try {
    const { postId, userId, text } = req.body;
    const newComment = new Comment({ postId, userId, text });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};
