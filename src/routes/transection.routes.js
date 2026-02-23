const express = require("express");
const tansectionroutes = express.Router();
const {
  authmiddleware,
  authSystemMiddleware,
} = require("../middleware/auth.middleware.js");
const {
  createTransection,
  createInitialFunds,
} = require("../controller/transection.controller.js");

tansectionroutes.post("/", authmiddleware, createTransection);
tansectionroutes.post(
  "/system/initial-funds",
  authSystemMiddleware,
  createInitialFunds,
);

module.exports = tansectionroutes;
