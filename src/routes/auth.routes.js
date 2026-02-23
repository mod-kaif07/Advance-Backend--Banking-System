const express = require("express");
const router = express.Router();
const { registeruser, loginUser,logoutController } = require("../controller/auth.controller");

router.post("/register", registeruser);
router.get("/login", loginUser);
router.post("/logout", logoutController);

module.exports = router;
