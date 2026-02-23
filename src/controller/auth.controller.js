const userModel = require("../models/user.model");
const blacklisttoken = require("../models/blacklist.model.js");
const mongoose = require("mongoose");
const { sendRegistrationEmail } = require("../services/email.services");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registeruser = async (req, res) => {
  const { email, name, password } = req.body;

  const userExist = await userModel.findOne({
    email: email,
  });
  if (userExist) {
    return res
      .status(422)
      .json({ message: "User already exist with email", status: "Failed" });
  }
  try {
    const userRegister = await userModel.create({
      email,
      password,
      name,
    });
    const token = jwt.sign({ id: userRegister._id }, process.env.JWT_SECRET);

    res.cookie("token", token);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: userRegister.name,
        email: userRegister.email,
      },
      token: token,
    });
    await sendRegistrationEmail(email, name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong Try agian " });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const findUser = await userModel.findOne({ email }).select("+password");

  if (!findUser) {
    return res.status(401).json({ message: "Register first " });
  }
  const isvalidPassword = await findUser.comparePassword(password);
  if (isvalidPassword) {
    const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET);

    res.cookie("token", token);
    res.status(200).json({
      message: "User login successfully",
      user: {
        name: findUser.name,
        email: findUser.email,
      },
      token: token,
    });
  } else {
    res.status(401).json({ message: "Invalid Crendetials" });
  }
};

exports.logoutController = async (req, res) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  if (!token) {
    res.status(400).json({ message: "Allready logout " });
  }

  res.clearCookie("token")
  await blacklisttoken.create({
    token: token, 
  });
  res.status(201).json({ message: "User Logout Sucessfully " });
};
