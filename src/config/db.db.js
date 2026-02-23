require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connect sucessfully ");
  } catch (error) {
    console.log("Cant Connect to Database");
    process.exit(1);
  }
}

module.exports = connectDB;
