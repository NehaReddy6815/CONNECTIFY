const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {        // User who sent the message
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {      // User who receives the message
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {            // Message content
      type: String,
      required: true,
    },
    read: {            // Has the receiver read this message?
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

module.exports = mongoose.model("Message", messageSchema);
