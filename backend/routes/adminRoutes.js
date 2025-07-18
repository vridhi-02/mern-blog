// routes/adminRoutes.js

const express = require("express");
const {
  getAllUsers,
  deleteUser,
  getAllBlogs,
  deleteBlog
} = require("../controllers/adminController");

const auth = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ All admin routes are protected by auth + adminCheck
router.use(auth, adminCheck);

// 📄 Manage Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// 📝 Manage Blogs
router.get("/blogs", getAllBlogs);
router.delete("/blogs/:id", deleteBlog);

module.exports = router;
