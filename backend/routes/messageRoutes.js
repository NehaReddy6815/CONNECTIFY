const express = require("express");
const router = express.Router();
const Message = require("../models/message");

// GET all messages between two users
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 }); // oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MARK a message as read
router.put("/:id/read", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
