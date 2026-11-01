// Generate and read the timetable.
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const Settings = require("../models/Settings");
const Timetable = require("../models/Timetable");
const { generateTimetable } = require("../services/scheduler");

// Runs the algorithm and saves the result. Also used by the seed script.
async function buildAndSaveTimetable() {
  const settings = await Settings.getSingle();
  const rooms = await Room.find().lean();
  const allSubjects = await Subject.find().populate("teacher").populate("classGroup").lean();

  // Skip subjects whose teacher or class was deleted.
  const subjects = allSubjects.filter((s) => s.teacher && s.classGroup);

  const { slots, unplaced } = generateTimetable({
    subjects,
    rooms,
    days: settings.days,
    periodsPerDay: settings.periodsPerDay,
  });

  // We keep only one timetable: the newest one replaces the old one.
  await Timetable.deleteMany({});
  return Timetable.create({
    days: settings.days,
    periodsPerDay: settings.periodsPerDay,
    slots,
    unplaced,
  });
}

// Loads the saved timetable with names filled in (not just ids).
async function loadTimetable() {
  const timetable = await Timetable.findOne()
    .populate("slots.classGroup", "name")
    .populate("slots.subject", "name code needsLab")
    .populate("slots.teacher", "name")
    .populate("slots.room", "name type")
    .lean();
  if (!timetable) return null;

  const settings = await Settings.getSingle();
  // If something was deleted after generating, hide those slots.
  timetable.slots = timetable.slots.filter((s) => s.classGroup && s.subject && s.teacher && s.room);
  timetable.periodTimes = settings.periodTimes;
  return timetable;
}

// POST /api/timetable/generate
async function generate(req, res) {
  const count = await Subject.countDocuments();
  if (count === 0) {
    return res.status(400).json({ message: "Add some subjects first." });
  }
  await buildAndSaveTimetable();
  res.json(await loadTimetable());
}

// GET /api/timetable              -> whole timetable
// GET /api/timetable/class/:id    -> only one class
// GET /api/timetable/teacher/:id  -> only one teacher
// GET /api/timetable/room/:id     -> only one room
function getTimetable(filterField) {
  return async (req, res) => {
    const timetable = await loadTimetable();
    if (!timetable) {
      return res.status(404).json({ message: "No timetable yet. The admin needs to generate it." });
    }
    if (filterField) {
      timetable.slots = timetable.slots.filter((s) => String(s[filterField]._id) === req.params.id);
    }
    res.json(timetable);
  };
}

// GET /api/rooms/free?day=Mon&period=2
// Returns every room with busy = true/false and who is using it.
async function freeRooms(req, res) {
  const { day } = req.query;
  const period = Number(req.query.period);
  if (!day || !period) {
    return res.status(400).json({ message: "Give a day and a period." });
  }

  const rooms = await Room.find().sort("name").lean();
  const timetable = await loadTimetable();
  const slotsNow = timetable ? timetable.slots.filter((s) => s.day === day && s.period === period) : [];

  const result = rooms.map((room) => {
    const slot = slotsNow.find((s) => String(s.room._id) === String(room._id));
    return {
      room,
      busy: Boolean(slot),
      usedBy: slot
        ? { classGroup: slot.classGroup.name, subject: slot.subject.name, teacher: slot.teacher.name }
        : null,
    };
  });

  res.json(result);
}

module.exports = { buildAndSaveTimetable, generate, getTimetable, freeRooms };
