const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");

// Decode user ID from token
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).id;
  } catch (err) {
    console.error("Token decoding error:", err.message);
    return null;
  }
};

// ---------------------------
// POST - Create a new post
// ---------------------------
router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { text, image } = req.body;

    // Validate: must have text or image
    if (!text?.trim() && !image) {
      return res.status(400).json({ message: "Post must have text or image" });
    }

    // Create new post
    const newPost = new Post({
      userId: currentUserId,
      text: text?.trim() || "",
      image: image || null,
      likes: [],
      comments: []
    });

    await newPost.save();

    // Populate user info before sending response
    const populatedPost = await Post.findById(newPost._id)
      .populate("userId", "name email profilePicture");

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------
// GET posts from following (Feed) - ONLY following, not own posts
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(currentUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ONLY fetch posts from users you're following (NOT your own posts)
    const posts = await Post.find({
      userId: { $in: user.following || [] }  // Removed currentUserId
    })
      .populate("userId", "name email profilePicture")
      .populate("comments.userId", "name email profilePicture")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (err) {
    console.error("Error fetching feed:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// PUT - Like/Unlike a post
// ---------------------------
router.put("/:id/like", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(currentUserId);
    
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(currentUserId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    
    res.json({ likes: post.likes });
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// GET all posts by a user
// ---------------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email profilePicture")
      .populate("comments.userId", "name email profilePicture");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// GET all comments for a post
// ---------------------------
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.userId",
      "name profilePicture"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// POST a comment
// ---------------------------
router.post("/:id/comments", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const text = req.body.text?.trim();
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const comment = { userId: currentUserId, text };
    post.comments.push(comment);
    await post.save();

    // Populate the new comment's user info
    const populatedPost = await Post.findById(post._id).populate(
      "comments.userId",
      "name profilePicture"
    );

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// DELETE a comment
// ---------------------------
router.delete("/:postId/comments/:commentId", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const commentUserId = comment.userId ? comment.userId.toString() : null;
    const postUserId = post.userId ? post.userId.toString() : null;

    // Only comment owner OR post owner can delete
    if (commentUserId !== currentUserId && postUserId !== currentUserId) {
      return res.status(403).json({ message: "Cannot delete this comment" });
    }

    // Remove comment safely, ignore old invalid comments
    post.comments.pull(comment._id);
    await post.save({ validateBeforeSave: false });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// DELETE a post
// ---------------------------
router.delete("/:postId", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const currentUserId = getUserIdFromToken(token);
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if current user is the post owner
    const postUserId = post.userId ? post.userId.toString() : null;
    if (postUserId !== currentUserId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.postId);
    
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
