const express = require("express");
const router = express.Router();
const { authmiddleware } = require("../middleware/auth.middleware");
const {
  userController,
  getUserAccount,
  fetchAccountBalance,
} = require("../controller/user.controller");

router.post("/create-user", authmiddleware, userController);

router.get("/", authmiddleware, getUserAccount);

router.get("/balance/:accountID", authmiddleware, fetchAccountBalance);

module.exports = router;
