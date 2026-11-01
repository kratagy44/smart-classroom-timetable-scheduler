// Fills the database with sample data so the project can be shown quickly.
// Run with:  npm run seed
// WARNING: this deletes all existing data first.
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Teacher = require("../models/Teacher");
const ClassGroup = require("../models/ClassGroup");
const Room = require("../models/Room");
const Subject = require("../models/Subject");
const Settings = require("../models/Settings");
const Timetable = require("../models/Timetable");
const { buildAndSaveTimetable } = require("../controllers/timetableController");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Removing old data...");

  await Promise.all([
    User.deleteMany({}),
    Teacher.deleteMany({}),
    ClassGroup.deleteMany({}),
    Room.deleteMany({}),
    Subject.deleteMany({}),
    Settings.deleteMany({}),
    Timetable.deleteMany({}),
  ]);

  // Settings: Mon–Fri, 6 periods (the defaults in the Settings model)
  await Settings.create({});

  // Teachers
  const t = await Teacher.insertMany([
    { name: "Dr. Anil Sharma", email: "anil.sharma@college.edu", department: "CSE" },
    { name: "Prof. Priya Nair", email: "priya.nair@college.edu", department: "CSE" },
    { name: "Dr. Rahul Verma", email: "rahul.verma@college.edu", department: "CSE" },
    { name: "Prof. Sneha Patil", email: "sneha.patil@college.edu", department: "Maths" },
    { name: "Dr. Arjun Mehta", email: "arjun.mehta@college.edu", department: "CSE" },
    { name: "Prof. Kavita Rao", email: "kavita.rao@college.edu", department: "CSE" },
    { name: "Dr. Imran Khan", email: "imran.khan@college.edu", department: "CSE" },
    { name: "Prof. Neha Gupta", email: "neha.gupta@college.edu", department: "English" },
  ]);

  // Classes
  const [c2a, c2b, c3a] = await ClassGroup.insertMany([
    { name: "CSE-2A", year: 2, department: "CSE", strength: 60 },
    { name: "CSE-2B", year: 2, department: "CSE", strength: 60 },
    { name: "CSE-3A", year: 3, department: "CSE", strength: 55 },
  ]);

  // Rooms
  await Room.insertMany([
    { name: "Room 101", capacity: 70, type: "classroom" },
    { name: "Room 102", capacity: 70, type: "classroom" },
    { name: "Room 103", capacity: 60, type: "classroom" },
    { name: "Room 104", capacity: 60, type: "classroom" },
    { name: "Computer Lab 1", capacity: 60, type: "lab" },
    { name: "Computer Lab 2", capacity: 65, type: "lab" },
  ]);

  // Subjects: [name, code, teacher, class, periods per week, needs lab]
  const subjects = [
    ["Data Structures", "CS201", t[0], c2a, 4, false],
    ["DBMS", "CS202", t[1], c2a, 4, false],
    ["Operating Systems", "CS203", t[2], c2a, 4, false],
    ["Discrete Maths", "MA201", t[3], c2a, 4, false],
    ["Data Structures Lab", "CS211", t[0], c2a, 2, true],
    ["DBMS Lab", "CS212", t[1], c2a, 2, true],
    ["Communication Skills", "HS201", t[7], c2a, 2, false],

    ["Data Structures", "CS201", t[4], c2b, 4, false],
    ["DBMS", "CS202", t[1], c2b, 4, false],
    ["Operating Systems", "CS203", t[2], c2b, 4, false],
    ["Discrete Maths", "MA201", t[3], c2b, 4, false],
    ["Data Structures Lab", "CS211", t[4], c2b, 2, true],
    ["DBMS Lab", "CS212", t[5], c2b, 2, true],
    ["Communication Skills", "HS201", t[7], c2b, 2, false],

    ["Computer Networks", "CS301", t[5], c3a, 4, false],
    ["Software Engineering", "CS302", t[6], c3a, 4, false],
    ["Web Technology", "CS303", t[4], c3a, 4, false],
    ["Artificial Intelligence", "CS304", t[0], c3a, 4, false],
    ["Networks Lab", "CS311", t[5], c3a, 2, true],
    ["Web Technology Lab", "CS313", t[6], c3a, 2, true],
    ["Aptitude", "HS301", t[3], c3a, 2, false],
  ];
  await Subject.insertMany(
    subjects.map(([name, code, teacher, classGroup, periodsPerWeek, needsLab]) => ({
      name, code, teacher: teacher._id, classGroup: classGroup._id, periodsPerWeek, needsLab,
    }))
  );

  // Login accounts
  const adminPass = await bcrypt.hash("admin123", 10);
  const teacherPass = await bcrypt.hash("teacher123", 10);
  const studentPass = await bcrypt.hash("student123", 10);

  await User.create({ name: "College Admin", email: "admin@college.edu", password: adminPass, role: "admin" });
  await User.insertMany(
    t.map((teacher) => ({
      name: teacher.name, email: teacher.email, password: teacherPass, role: "teacher", teacher: teacher._id,
    }))
  );
  await User.insertMany(
    [c2a, c2b, c3a].map((c) => ({
      name: `Student ${c.name}`,
      email: `${c.name.toLowerCase().replace("-", "")}@college.edu`, // e.g. cse2a@college.edu
      password: studentPass,
      role: "student",
      classGroup: c._id,
    }))
  );

  // Make the first timetable so every page has something to show.
  const timetable = await buildAndSaveTimetable();
  console.log(`Timetable generated: ${timetable.slots.length} lectures placed, ${timetable.unplaced.length} problems.`);

  console.log("\nSample data added. You can log in with:");
  console.log("  Admin:    admin@college.edu        / admin123");
  console.log("  Teacher:  anil.sharma@college.edu  / teacher123");
  console.log("  Student:  cse2a@college.edu        / student123");

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
