const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const { generate, getTimetable } = require("../controllers/timetableController");

const router = express.Router();

router.post("/generate", auth, allow("admin"), generate);
router.get("/", auth, getTimetable());
router.get("/class/:id", auth, getTimetable("classGroup"));
router.get("/teacher/:id", auth, getTimetable("teacher"));
router.get("/room/:id", auth, getTimetable("room"));

module.exports = router;
