const express = require("express");
const auth = require("../middleware/auth");
const { login, me } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.get("/me", auth, me);

module.exports = router;
