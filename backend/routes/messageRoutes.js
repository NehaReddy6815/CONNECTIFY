const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

// Get users separated by followed/not followed
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    // Get all users except current user
    const allUsers = await User.find({ 
      _id: { $ne: req.user.id } 
    }).select("name username email");

    // Separate into followed and not followed
    const followed = allUsers.filter(user => 
      currentUser.following && currentUser.following.some(
        followId => followId.toString() === user._id.toString()
      )
    );
    
    const notFollowed = allUsers.filter(user => 
      !currentUser.following || !currentUser.following.some(
        followId => followId.toString() === user._id.toString()
      )
    );

    res.json({ followed, notFollowed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get conversation between two users
router.get("/:userId/:receiverId", authMiddleware, async (req, res) => {
  try {
    const { userId, receiverId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
    .sort({ createdAt: 1 })
    .populate("sender", "name username")
    .populate("receiver", "name username");

    // Transform to match frontend expected format
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      senderId: msg.sender._id,
      receiverId: msg.receiver._id,
      text: msg.text,
      createdAt: msg.createdAt,
      read: msg.read
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Mark messages as read
router.put("/read/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { read: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark message as read" });
  }
});

// Delete a message
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only sender can delete
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

module.exports = router;