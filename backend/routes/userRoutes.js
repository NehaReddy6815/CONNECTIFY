// userRoutes.js - Routes for user information

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post'); // assuming you have a Post model

// GET route - Fetch user information by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user by ID (exclude password)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || []
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user information' });
  }
});

// PUT route - Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = tokenPayload.id;

    if (userId !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Update user information
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        username: username || undefined,
        email: email || undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE route - Delete user account
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = tokenPayload.id;

    if (userId !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this account' });
    }

    // Delete user's posts
    await Post.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});


// Follow / Unfollow a user
router.put("/:userId/follow", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const currentUserId = tokenPayload.id;

    const { userId } = req.params;

    if (userId === currentUserId)
      return res.status(400).json({ message: "Cannot follow yourself" });

    const User = require("../models/User");

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: "User not found" });

    if (!userToFollow.followers.includes(currentUserId)) {
      // Follow
      userToFollow.followers.push(currentUserId);
      currentUser.following.push(userId);
      await userToFollow.save();
      await currentUser.save();
      return res.json({ message: "Followed successfully" });
    } else {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUserId
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userId
      );
      await userToFollow.save();
      await currentUser.save();
      return res.json({ message: "Unfollowed successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
