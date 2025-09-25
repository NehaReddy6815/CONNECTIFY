const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    image: { type: String }, // optional image URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
