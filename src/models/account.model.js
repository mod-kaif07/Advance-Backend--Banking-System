const mongoose = require("mongoose");
const ledgerModel = require("../models/ledger.model.js");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with user"],
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "FROZEN"],
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index (optimize queries like: find({ user, status }))
accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    {
      $match: {
        account: new mongoose.Types.ObjectId(this._id),
       
      },
    },
    {
      $group: {
        _id: null,
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalCredit: 1,
        totalDebit: 1,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  // ✅ Always return a plain number instead of an object
  return balanceData[0]?.balance ?? 0;
};

const accountModel = mongoose.model("Account", accountSchema);
module.exports = accountModel;
