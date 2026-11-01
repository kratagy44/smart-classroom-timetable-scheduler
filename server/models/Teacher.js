// A teacher (faculty member).
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Teacher name is required."], trim: true },
    email: { type: String, trim: true, lowercase: true },
    department: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
