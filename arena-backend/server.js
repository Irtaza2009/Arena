const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS config
app.use(
  cors({
    origin: ["https://arena.irtaza.xyz", "http://localhost:3000"],
    credentials: true,
  })
);

// Basic middleware
app.use(express.json());
app.use(cookieParser());

// SESSION setup
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Set to true in production with HTTPS
      sameSite: "none",
    },
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
