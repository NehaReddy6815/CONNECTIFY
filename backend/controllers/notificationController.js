const Notification = require("../models/notification");

// GET notifications for a user
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// CREATE a notification
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, senderId, type, postId, message } = req.body;
    const newNotification = new Notification({ userId, senderId, type, postId, message });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    next(err);
  }
};
