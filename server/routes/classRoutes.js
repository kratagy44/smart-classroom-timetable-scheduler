const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const makeCrud = require("../controllers/crudController");
const ClassGroup = require("../models/ClassGroup");
const Subject = require("../models/Subject");
const User = require("../models/User");

const crud = makeCrud(ClassGroup, {
  beforeDelete: async (id) => {
    if (await Subject.exists({ classGroup: id })) {
      return "This class still has subjects. Delete those subjects first.";
    }
    if (await User.exists({ classGroup: id })) {
      return "This class still has student login accounts. Delete them on the Users page first.";
    }
    return null;
  },
});

const router = express.Router();

router.get("/", auth, crud.list);
router.post("/", auth, allow("admin"), crud.create);
router.put("/:id", auth, allow("admin"), crud.update);
router.delete("/:id", auth, allow("admin"), crud.remove);

module.exports = router;
