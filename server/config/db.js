// Connects our server to the MongoDB database.
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    console.error("Is MongoDB running? Check MONGO_URI in server/.env");
    process.exit(1); // stop the server, it cannot work without a database
  }
}

module.exports = connectDB;
