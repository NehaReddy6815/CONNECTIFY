const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');


const authMiddleware = require("../middleware/authMiddleware");

// GET all users (for Inbox), excluding current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ----------------------
// GET user by ID
// ----------------------
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      name: user.name,  
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || [],
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// ----------------------
// PUT - Update user
// ----------------------
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const currentUserId = tokenPayload.id;

    if (userId !== currentUserId)
      return res.status(403).json({ message: 'Not authorized to update this profile' });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: username || undefined, email: email || undefined, name: name || undefined, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// ----------------------
// DELETE - Delete user
// ----------------------
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const currentUserId = tokenPayload.id;

    if (userId !== currentUserId)
      return res.status(403).json({ message: 'Not authorized to delete this account' });

    // Delete user's posts (use userId field in Post schema)
    await Post.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// ----------------------
// PUT - Follow / Unfollow
// ----------------------
router.put('/:userId/follow', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const currentUserId = tokenPayload.id;

    const { userId } = req.params;

    if (userId === currentUserId)
      return res.status(400).json({ message: 'Cannot follow yourself' });

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: 'User not found' });

    if (!userToFollow.followers.includes(currentUserId)) {
      // Follow
      userToFollow.followers.push(currentUserId);
      currentUser.following.push(userId);
    } else {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
      currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ message: userToFollow.followers.includes(currentUserId) ? 'Followed successfully' : 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
