require("dotenv").config();
const userModel = require("../models/user.model");
const tokenBlackListedModel = require("../models/blacklist.model.js");
const jwt = require("jsonwebtoken");

exports.authmiddleware = async (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).josn({ message: "Create account / login " });
  }

  const isTokenBlacklisted = await tokenBlackListedModel.findOne({ token });
  if (isTokenBlacklisted) {
    return res.status(401).json({
      message:
        "For your security, this session is no longer valid. Please log in again.",
    });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({ message: "Create account / login" });
    }
    const user = await userModel.findById(decode.id);
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authSystemMiddleware = async (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required. Please log in or create an account.",
    });
  }

  const isTokenBlacklisted = await tokenBlackListedModel.findOne({ token });
  if (isTokenBlacklisted) {
    return res.status(401).json({
      message:
        "For your security, this session is no longer valid. Please log in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid or expired token. Please log in again.",
      });
    }

    const user = await userModel.findById(decoded.id).select("+systemUser");

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please log in again.",
      });
    }

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Access denied. System users only.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("authSystemMiddleware error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
