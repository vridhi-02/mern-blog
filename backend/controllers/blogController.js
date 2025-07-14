const getBlogs = async (req, res) => {
  res.json([{ title: "Welcome to the Blog!", content: "This is a demo post." }]);
};

module.exports = { getBlogs };
