// userRoutes.js - Routes for user information

const express = require('express');
const router = express.Router();

// GET route - Fetch user information by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require('../models/User'); // Your User model
    
    // Find user by ID (exclude password)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user information' });
  }
});

// PUT route - Update user profile (optional)
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode token to get user ID
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = tokenPayload.id;

    // Check if user is updating their own profile
    if (userId !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const User = require('../models/User');
    
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

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

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

module.exports = router;