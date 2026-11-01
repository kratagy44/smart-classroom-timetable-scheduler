// A class / section of students, for example "CSE-3A".
// (Named ClassGroup because "class" is a reserved word in JavaScript.)
const mongoose = require("mongoose");

const classGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Class name is required."], unique: true, trim: true },
    year: { type: Number, min: [1, "Year must be 1 to 6."], max: [6, "Year must be 1 to 6."] },
    department: { type: String, trim: true },
    // number of students
    strength: {
      type: Number,
      required: [true, "Number of students is required."],
      min: [1, "Number of students must be at least 1."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassGroup", classGroupSchema);
