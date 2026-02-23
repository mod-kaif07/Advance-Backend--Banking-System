const accountModel = require("../models/account.model");
const userModel = require("../models/user.model.js");

exports.userController = async (req, res) => {
  try {
    // ✅ Always trust user from middleware, not from client
    const userId = req.user._id;

    // (Optional) prevent multiple accounts per user
    const existingAccount = await accountModel.findOne({ user: userId });
    if (existingAccount) {
      return res
        .status(409)
        .json({ message: "Account already exists for this user" });
    }

    const account = await accountModel.create({
      user: userId,
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    console.error("Create account error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserAccount = async (req, res) => {
  // console.log(req.user)
  const user = await accountModel.find({ user: req.user._id });
  res.status(200).json({ message: "User Details", user: user });
};

exports.fetchAccountBalance = async (req, res) => {
  const { accountID } = req.params;
  const isValidAccount = await accountModel.findOne({
    _id: accountID,
    user: req.user._id,
  });
  if (!isValidAccount) {
    return res.status(404).json({ message: "Account not found" });
  }

  const balance = await isValidAccount.getBalance();
  return res.status(200).json({
    user: req.user._id,
    message: "Balance fetched successfully",
    balance,
  });
};
