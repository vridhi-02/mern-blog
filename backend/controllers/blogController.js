const Blog = require("../models/Blog");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// ✅ Get all blogs with optional search/category filters
const getBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// ✅ Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("user", "username")
      .populate("comments.user", "username");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error("Error fetching blog by ID:", err);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// ✅ Like or Unlike blog
const likeOrUnlikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user.id;

    if (blog.likes.includes(userId)) {
      // Unlike
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      blog.likes.push(userId);
    }

    await blog.save();
    res.json({ message: "Like status updated" });
  } catch (err) {
    console.error("Error liking blog:", err);
    res.status(500).json({ message: "Failed to like blog" });
  }
};

// ✅ Add comment
const addComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments.push({
      text: req.body.text,
      user: req.user.id,
    });

    await blog.save();
    res.json({ message: "Comment added" });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// ✅ Delete comment (optional)
const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments = blog.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    await blog.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// ✅ Create blog
const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    if (category && category.trim()) {
      const formattedCategory = category.trim();

      const existing = await Category.findOne({
        name: { $regex: `^${formattedCategory}$`, $options: "i" },
      });

      if (!existing) {
        await Category.create({ name: formattedCategory });
      }
    }

    const blog = new Blog({
      title,
      content,
      category: category || "General",
      tags: Array.isArray(tags) ? tags : [],
      user: req.user.id,
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, category } = req.body;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized to update this blog" });

    blog.title = title;
    blog.content = content;
    blog.tags = tags;
    blog.category = category;
    await blog.save();

    res.json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to update blog", error: err.message });
  }
};
// DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized to delete this blog" });

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blog", error: err.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

   
    await Blog.deleteMany({ user: userId });

  
    await Blog.updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } }
    );

    await User.findByIdAndDelete(userId);

    res.json({ message: "Account and related content deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  likeOrUnlikeBlog,
  addComment,
  deleteComment,
  updateBlog,
  deleteBlog,
  deleteUser,
};
