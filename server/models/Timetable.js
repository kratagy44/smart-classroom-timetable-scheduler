// The generated timetable. It is simply a list of "slots".
// One slot = one lecture: (day, period, class, subject, teacher, room).
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const slotSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    period: { type: Number, required: true }, // 1, 2, 3 ...
    classGroup: { type: ObjectId, ref: "ClassGroup", required: true },
    subject: { type: ObjectId, ref: "Subject", required: true },
    teacher: { type: ObjectId, ref: "Teacher", required: true },
    room: { type: ObjectId, ref: "Room", required: true },
  },
  { _id: false }
);

// Lectures the algorithm could not fit, with the reason (shown to the admin).
const unplacedSchema = new mongoose.Schema(
  {
    subject: String,
    classGroup: String,
    teacher: String,
    missing: Number, // how many periods could not be placed
    reason: String,
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    days: [String],
    periodsPerDay: Number,
    slots: [slotSchema],
    unplaced: [unplacedSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
