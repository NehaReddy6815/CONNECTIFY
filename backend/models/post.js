const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String }, // optional text
    image: { type: String }, // optional image
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
