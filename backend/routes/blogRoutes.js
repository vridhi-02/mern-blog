const express = require("express");
const { getBlogs } = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getBlogs);

module.exports = router;
