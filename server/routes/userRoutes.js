const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const { listUsers, createUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

// Every user route is admin only.
router.use(auth, allow("admin"));

router.get("/", listUsers);
router.post("/", createUser);
router.delete("/:id", deleteUser);

module.exports = router;
