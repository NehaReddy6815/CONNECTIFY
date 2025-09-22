const User = require("../models/user");

// GET user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // hide password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// UPDATE user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,        // make sure password is hashed if updating
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};
