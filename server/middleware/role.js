// Allows the request only if the logged-in user has one of the given roles.
// Example: router.post("/", auth, allow("admin"), createTeacher)
function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to do this." });
    }
    next();
  };
}

module.exports = allow;
