const transactionModel = require("../models/transections.model.js");
const ledgerModel = require("../models/ledger.model.js");
const accountModel = require("../models/account.model.js");
const emailService = require("../services/email.services.js");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

exports.createTransection = async function createTransaction(req, res) {
  /**
   * 1. Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate idempotency key
   */
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  /**
   * 3. Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  /**
   * 4. Derive sender and receiver balance from ledger
   */
  const senderBalance = await fromUserAccount.getBalance();
  const receiverBalance = await toUserAccount.getBalance();

  if (senderBalance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${senderBalance}. Requested amount is ${amount}`,
    });
  }

  let transaction;
  try {
    /**
     * 5. Create transaction (PENDING)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    /**
     * 6. Create DEBIT ledger entry for sender
     */
    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
          balanceAfterTransaction: senderBalance - amount,
        },
      ],
      { session },
    );
    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();

    /**
     * 7. Create CREDIT ledger entry for receiver
     */
    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
          balanceAfterTransaction: receiverBalance + amount,
        },
      ],
      { session },
    );

    /**
     * 8. Mark transaction COMPLETED
     */
    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    /**
     * 9. Commit MongoDB session
     */
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  }

  /**
   * 10. Send email notification
   */
  const maskedAccount = String(toAccount).slice(-4).padStart(12, "*");

  await emailService.sendTransactionEmail(
    req.user.email, // must be a real email
    req.user.name, // must exist
    amount,
    maskedAccount, // ✅ just pass the masked value
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
};

exports.createInitialFunds = async function createInitialFundsTransaction(
  req,
  res,
) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await accountModel.findOne({ user: req.user._id });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  /**
   * Get receiver's current balance before starting session
   */
  const receiverBalance = await toUserAccount.getBalance();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /**
     * Create transaction record
     */
    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await transaction.save({ session });

    /**
     * ✅ Only create CREDIT ledger entry for the receiver.
     *
     * The system/bank account is the source of initial funds.
     * It does NOT track a balance in the ledger — it issues money
     * into the system. Creating a DEBIT entry for it would produce
     * a negative balanceAfterTransaction (0 - amount) which is invalid.
     *
     * This is standard double-entry bookkeeping for a bank:
     * the bank's own capital account is outside the user ledger system.
     */
    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
          balanceAfterTransaction: receiverBalance + amount,
        },
      ],
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    const userEmail = toUserAccount.user.email;
    const userName = toUserAccount.user.name || "Customer";
    const maskedAccount = String(toAccount).slice(-4).padStart(12, "*");

    await emailService.sendTransactionEmail(
      userEmail,
      userName,
      amount,
      maskedAccount,
    );

    return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Initial funds error:", error);
    return res.status(500).json({
      message: "Failed to create initial funds, please retry",
      error: error.message,
    });
  }
};
