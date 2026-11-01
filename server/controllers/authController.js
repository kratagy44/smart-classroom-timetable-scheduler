// Login and "who am I".
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Makes a login token that is valid for 7 days.
function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Removes the password before sending a user to the browser.
function safeUser(user) {
  const { password, ...rest } = user.toObject();
  return rest;
}

// POST /api/auth/login   body: { email, password }
async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ message: "Please enter email and password." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Same message for both cases, so nobody can guess which emails exist.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Wrong email or password." });
  }

  res.json({ token: makeToken(user), user: safeUser(user) });
}

// GET /api/auth/me
async function me(req, res) {
  res.json(req.user);
}

module.exports = { login, me };
