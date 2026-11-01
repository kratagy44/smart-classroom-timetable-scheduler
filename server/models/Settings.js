// College-wide settings: working days and periods. There is only one Settings document.
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  days: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  periodsPerDay: { type: Number, default: 6, min: 1, max: 12 },
  // One time range per period, e.g. "09:00-10:00". Used to show times and find "now".
  periodTimes: {
    type: [String],
    default: ["09:00-10:00", "10:00-11:00", "11:15-12:15", "12:15-13:15", "14:00-15:00", "15:00-16:00"],
  },
});

// Returns the settings, creating the default one the first time.
settingsSchema.statics.getSingle = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
