const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const { getSettings, updateSettings } = require("../controllers/settingsController");

const router = express.Router();

router.get("/", auth, getSettings);
router.put("/", auth, allow("admin"), updateSettings);

module.exports = router;
