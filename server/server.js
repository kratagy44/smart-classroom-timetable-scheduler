// Starting point of the backend.
require("dotenv").config({ quiet: true }); // loads values from the .env file
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware that runs for every request
app.use(cors()); // allow the React app to call this server
app.use(express.json()); // read JSON sent in the request body

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));

// Unknown API URL
app.use("/api", (req, res) => res.status(404).json({ message: "API route not found." }));

// If the React app has been built (client/dist), serve it from this same server.
const clientBuild = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get("/{*any}", (req, res) => res.sendFile(path.join(clientBuild, "index.html")));
}

// Error handler: turns database errors into friendly messages.
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    return res.status(400).json({ message: `This ${field} already exists.` });
  }
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first ? first.message : "Invalid data." });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}.` });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

// Without these the app cannot work, so stop with a clear message.
for (const name of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[name]) {
    console.error(`${name} is missing. Copy server/.env.example to server/.env and fill it in.`);
    process.exit(1);
  }
}

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
