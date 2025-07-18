const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Blog = require("../models/Blog"); // ✅ Required to delete related blogs

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { username, bio, avatar, password } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // ✅ Update basic fields
  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;

  // ✅ Handle password update
  if (password && password.trim()) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  const updatedUser = await User.findById(req.user.id).select("-password");
  res.json(updatedUser);
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await Blog.deleteMany({ user: userId });

    await Blog.updateMany(
      {},
      { $pull: { comments: { user: userId } } }
    );

    // 3. Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Failed to delete account" });
  }
};
