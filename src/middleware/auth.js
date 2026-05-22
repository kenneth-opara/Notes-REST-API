const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Token has expired. Please log in again." : "Invalid token.";
    return res.status(401).json({ status: "error", message });
  }

  // 3. Check user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ status: "error", message: "User no longer exists." });
  }

  req.user = user;
  next();
};

module.exports = { protect };