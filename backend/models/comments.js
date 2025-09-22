const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {          // The post this comment belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {          // Who made the comment
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {            // The comment content
      type: String,
      required: true,
    },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Comment", commentSchema);
