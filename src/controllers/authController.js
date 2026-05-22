const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendAuthResponse = (res, statusCode, user, message) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    },
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ status: "error", message: "Email already in use." });
  }

  const user = await User.create({ name, email, password });
  sendAuthResponse(res, 201, user, "Account created successfully.");
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ status: "error", message: "Invalid email or password." });
  }

  sendAuthResponse(res, 200, user, "Logged in successfully.");
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    },
  });
};

module.exports = { register, login, getMe };