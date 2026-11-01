// A subject taught by one teacher to one class, a fixed number of times per week.
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Subject name is required."], trim: true },
    code: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: [true, "Choose a teacher."] },
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: "ClassGroup", required: [true, "Choose a class."] },
    periodsPerWeek: {
      type: Number,
      required: [true, "Periods per week is required."],
      min: [1, "Periods per week must be 1 to 20."],
      max: [20, "Periods per week must be 1 to 20."],
    },
    needsLab: { type: Boolean, default: false }, // true = must be held in a lab room
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
