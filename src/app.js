const express = require("express");
const connectDB = require("./config/db.db.js");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const transectionRoutes = require("./routes/transection.routes.js");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
connectDB();

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transections", transectionRoutes);

module.exports = app;
