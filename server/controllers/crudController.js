// CRUD = Create, Read, Update, Delete.
// Teachers, classes, rooms and subjects all need the same 4 actions,
// so this one function builds them for any Mongoose model.
//
// Usage: const teacherCrud = makeCrud(Teacher, { sort: "name" });
//        router.get("/", teacherCrud.list);

// Fields the browser must never change.
function cleanBody(body = {}) {
  const { _id, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

function makeCrud(Model, options = {}) {
  const { populate = [], sort = "name", beforeDelete } = options;

  return {
    // GET /  -> list all
    list: async (req, res) => {
      const items = await Model.find().populate(populate).sort(sort);
      res.json(items);
    },

    // POST /  -> add a new one
    create: async (req, res) => {
      const item = await Model.create(cleanBody(req.body));
      res.status(201).json(await item.populate(populate));
    },

    // PUT /:id  -> edit one
    update: async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, cleanBody(req.body), {
        returnDocument: "after", // return the updated version
        runValidators: true, // check the rules in the model again
      }).populate(populate);
      if (!item) return res.status(404).json({ message: "Not found." });
      res.json(item);
    },

    // DELETE /:id  -> remove one
    remove: async (req, res) => {
      // Optional check, e.g. "you cannot delete a teacher who still has subjects".
      if (beforeDelete) {
        const problem = await beforeDelete(req.params.id);
        if (problem) return res.status(400).json({ message: problem });
      }
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found." });
      res.json({ message: "Deleted." });
    },
  };
}

module.exports = makeCrud;
