// middleware/adminMiddleware.js
const User = require("../models/User");

const adminCheck = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = adminCheck;
