// postRoutes.js - Complete backend routes for posts

const express = require('express');
const router = express.Router();

// POST route - Create a new post (with base64 image)
router.post('/', async (req, res) => {
  try {
    const { userId, text, image } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!text && !image) {
      return res.status(400).json({ message: 'Either text or image is required' });
    }

    // Create post object
    const postData = {
      userId,
      text: text || '',
      createdAt: new Date()
    };

    // If image was provided (base64 string), store it directly
    if (image) {
      postData.image = image; // Store base64 string
    }

    // Save to database
    const Post = require('../models/Post'); // Your Post model
    const newPost = new Post(postData);
    const savedPost = await newPost.save();

    // Populate user information
    await savedPost.populate('userId', 'username');

    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
});

// GET route - Fetch all posts (for home feed)
router.get('/', async (req, res) => {
  try {
    const Post = require('../models/Post');
    const posts = await Post.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50);

    // Transform the data for frontend
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      username: post.userId?.username || 'Unknown User',
      text: post.text,
      image: post.image, // Base64 string or null
      createdAt: post.createdAt
    }));

    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// GET route - Fetch posts by specific user (for profile page)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const Post = require('../models/Post');
    
    const userPosts = await Post.find({ userId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 }); // Most recent first

    // Transform the data for frontend
    const transformedPosts = userPosts.map(post => ({
      _id: post._id,
      username: post.userId?.username || 'Unknown User',
      text: post.text,
      image: post.image, // Base64 string or null
      createdAt: post.createdAt
    }));

    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
});

// DELETE route - Delete a specific post (only if user owns it)
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode token to get user ID
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.id;

    const Post = require('../models/Post');
    
    // Find the post and check if user owns it
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// PUT route - Update/Edit a post (optional feature)
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode token to get user ID
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.id;

    const Post = require('../models/Post');
    
    // Find the post and check if user owns it
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { text: text || post.text, updatedAt: new Date() },
      { new: true }
    ).populate('userId', 'username');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

module.exports = router;