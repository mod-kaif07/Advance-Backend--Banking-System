const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Ledger entry must belong to an account"],
      index: true,
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Ledger must be linked to a transaction"],
      index: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
    },

    type: {
      type: String,
      enum: {
        values: ["CREDIT", "DEBIT"],
        message: "Type must be CREDIT or DEBIT",
      },
      required: true,
    },

    balanceAfterTransaction: {
      type: Number,
      required: true,
      min: [0, "Balance cannot be negative"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 255,
    },
  },
  { timestamps: true },
);

function preventLedgerModification(next) {
  const err = new Error(
    "Ledger entries are immutable and cannot be modified or deleted",
  );
  next(err);
}

// Block updates
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);

// Block deletes
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);

const LedgerModel = mongoose.model("Ledger", ledgerSchema);
module.exports = LedgerModel;
