const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const makeCrud = require("../controllers/crudController");
const { freeRooms } = require("../controllers/timetableController");
const Room = require("../models/Room");

const crud = makeCrud(Room);

const router = express.Router();

// "/free" must come before "/:id", otherwise "free" would be treated as an id.
router.get("/free", auth, freeRooms);

router.get("/", auth, crud.list);
router.post("/", auth, allow("admin"), crud.create);
router.put("/:id", auth, allow("admin"), crud.update);
router.delete("/:id", auth, allow("admin"), crud.remove);

module.exports = router;
