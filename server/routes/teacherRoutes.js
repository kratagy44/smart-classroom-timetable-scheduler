const express = require("express");
const auth = require("../middleware/auth");
const allow = require("../middleware/role");
const makeCrud = require("../controllers/crudController");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const User = require("../models/User");

const crud = makeCrud(Teacher, {
  beforeDelete: async (id) => {
    if (await Subject.exists({ teacher: id })) {
      return "This teacher still has subjects. Delete or change those subjects first.";
    }
    if (await User.exists({ teacher: id })) {
      return "This teacher still has a login account. Delete it on the Users page first.";
    }
    return null;
  },
});

const router = express.Router();

router.get("/", auth, crud.list); // anyone logged in can see the list
router.post("/", auth, allow("admin"), crud.create); // only admin can change
router.put("/:id", auth, allow("admin"), crud.update);
router.delete("/:id", auth, allow("admin"), crud.remove);

module.exports = router;
