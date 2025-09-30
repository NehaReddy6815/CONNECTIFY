const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware"); // your auth middleware

router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }); // exclude self
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Send a new message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text,
    });
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Get conversation between two users
router.get("/:userId/:receiverId", authMiddleware, async (req, res) => {
  try {
     const senderId = req.user.id; 
    const { userId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ createdAt: 1 }); // oldest first
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

module.exports = router;
