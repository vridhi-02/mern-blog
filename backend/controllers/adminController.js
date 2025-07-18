// controllers/adminController.js
const User = require("../models/User");
const Blog = require("../models/Blog");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
exports.getAllBlogs = async (req, res) => {
  const blogs = await Blog.find({ user: { $ne: null } })
    .populate("user", "username email")
    .lean();

  // Add counts
  blogs.forEach(blog => {
    blog.likesCount = blog.likes?.length || 0;
    blog.commentsCount = blog.comments?.length || 0;
  });

  res.json(blogs);
};




exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ message: "Server error while deleting blog" });
  }
};
