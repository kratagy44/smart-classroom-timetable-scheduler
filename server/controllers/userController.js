// Admin manages login accounts (admin / teacher / student).
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/users
async function listUsers(req, res) {
  const users = await User.find()
    .select("-password")
    .populate("teacher", "name")
    .populate("classGroup", "name")
    .sort("role name");
  res.json(users);
}

// POST /api/users   body: { name, email, password, role, teacher?, classGroup? }
async function createUser(req, res) {
  const { name, email, password, role = "student", teacher, classGroup } = req.body;

  if (!["admin", "teacher", "student"].includes(role)) {
    return res.status(400).json({ message: "Role must be admin, teacher or student." });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  if (role === "teacher" && !teacher) {
    return res.status(400).json({ message: "Choose which teacher this login belongs to." });
  }
  if (role === "student" && !classGroup) {
    return res.status(400).json({ message: "Choose the class of this student." });
  }

  const user = await User.create({
    name,
    email,
    role,
    password: await bcrypt.hash(password, 10), // hash = scrambled password
    teacher: role === "teacher" ? teacher : undefined,
    classGroup: role === "student" ? classGroup : undefined,
  });

  const saved = await User.findById(user._id)
    .select("-password")
    .populate("teacher", "name")
    .populate("classGroup", "name");
  res.status(201).json(saved);
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  if (String(req.user._id) === req.params.id) {
    return res.status(400).json({ message: "You cannot delete your own account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found." });
  res.json({ message: "Deleted." });
}

module.exports = { listUsers, createUser, deleteUser };
