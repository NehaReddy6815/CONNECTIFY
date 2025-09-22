const Message = require("../models/message");

// GET messages between two users
exports.getMessages = async (req, res, next) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// CREATE a new message
exports.createMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
};
