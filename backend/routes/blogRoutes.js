const express = require("express");
const {
  getBlogs,
  getBlogById,
  createBlog,
  likeOrUnlikeBlog,
  addComment,
  deleteComment,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Blog list and details
router.get("/", auth, getBlogs);
router.get("/:id", auth, getBlogById);

// ✅ Blog creation
router.post("/", auth, createBlog);

// ✅ Like & Comment
router.post("/:id/like", auth, likeOrUnlikeBlog);
router.post("/:id/comments", auth, addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);

router.put("/:id", auth, updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
