// A room where lectures happen: a normal classroom or a lab.
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Room name is required."], unique: true, trim: true },
    capacity: {
      type: Number,
      required: [true, "Capacity is required."],
      min: [1, "Capacity must be at least 1."],
    },
    type: { type: String, enum: ["classroom", "lab"], default: "classroom" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
