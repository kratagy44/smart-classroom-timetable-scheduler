const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const makeCrud = require("../controllers/crudController");
const Subject = require("../models/Subject");

// populate = also send the teacher's and class's names, not only their ids
const crud = makeCrud(Subject, {
  populate: [
    { path: "teacher", select: "name" },
    { path: "classGroup", select: "name strength" },
  ],
  sort: "name",
});

const router = express.Router();

router.get("/", auth, crud.list);
router.post("/", auth, allow("admin"), crud.create);
router.put("/:id", auth, allow("admin"), crud.update);
router.delete("/:id", auth, allow("admin"), crud.remove);

module.exports = router;
