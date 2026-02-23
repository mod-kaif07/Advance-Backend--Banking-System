const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [
        true,
        "Transaction must be associated with the receiver account",
      ],
      index: true,
    },
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [
        true,
        "Transaction must be associated with the sender account",
      ],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        message: "Status must be PENDING, COMPLETED, FAILED, or REVERSED",
      },
      default: "PENDING",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required to create this transaction"],
      min: [1, "Amount must be greater than zero"],
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

const TransactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = TransactionModel;
