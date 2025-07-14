const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected"));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
