// Working days and periods per day.
const Settings = require("../models/Settings");

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// GET /api/settings
async function getSettings(req, res) {
  res.json(await Settings.getSingle());
}

// PUT /api/settings   body: { days, periodsPerDay, periodTimes }
async function updateSettings(req, res) {
  const { days, periodsPerDay } = req.body;
  const periodTimes = Array.isArray(req.body.periodTimes) ? req.body.periodTimes : [];

  // Keep only real day names, in normal week order (Mon, Tue, ...).
  const workingDays = Array.isArray(days) ? ALL_DAYS.filter((d) => days.includes(d)) : [];
  if (workingDays.length === 0) {
    return res.status(400).json({ message: "Choose at least one working day." });
  }
  const count = Number(periodsPerDay);
  if (!Number.isInteger(count) || count < 1 || count > 12) {
    return res.status(400).json({ message: "Periods per day must be between 1 and 12." });
  }

  const settings = await Settings.getSingle();
  settings.days = workingDays;
  settings.periodsPerDay = count;
  // Make sure there is exactly one time per period (empty text if not given).
  settings.periodTimes = Array.from({ length: count }, (_, i) => String(periodTimes[i] || "").trim());
  await settings.save();

  res.json(settings);
}

module.exports = { getSettings, updateSettings };
