// Checks that the request has a valid login token (JWT).
// React sends it in the header like this:  Authorization: Bearer <token>
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET); // throws if token is fake or expired
    const user = await User.findById(data.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found. Please log in again." });

    req.user = user; // now every controller can use req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

module.exports = auth;
