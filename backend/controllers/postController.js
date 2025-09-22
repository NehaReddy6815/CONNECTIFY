const Post = require("../models/post");

// GET all posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err); // passes error to errorMiddleware
  }
};

// CREATE a new post
exports.createPost = async (req, res, next) => {
  try {
    const { title, caption, image } = req.body;
    const newPost = new Post({ title, caption, image });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};
