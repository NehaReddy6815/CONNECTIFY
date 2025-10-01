// routes/searchRoutes.js
const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Search users by name
router.get('/', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: 'Name query parameter is required' });
  }

  try {
    const users = await User.find({
      name: { $regex: name, $options: 'i' }, // Case-insensitive search
    }).limit(10); // Limit to 10 results
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
