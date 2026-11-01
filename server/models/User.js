// A person who can log in: admin, teacher or student.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required."], trim: true },
    email: { type: String, required: [true, "Email is required."], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    role: { type: String, enum: ["admin", "teacher", "student"], default: "student" },
    // A teacher login is linked to a Teacher, a student login to a ClassGroup.
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: "ClassGroup" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
