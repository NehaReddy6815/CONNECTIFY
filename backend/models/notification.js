const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {           // Who receives the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {         // Who triggered the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {             // Type of notification: "like", "comment", "follow", etc.
      type: String,
      required: true,
    },
    postId: {           // Optional: which post this relates to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    read: {             // Has the user read this notification?
      type: Boolean,
      default: false,
    },
    message: {          // Optional text
      type: String,
    },
  },
  { timestamps: true }  // adds createdAt & updatedAt
);

module.exports = mongoose.model("Notification", notificationSchema);
