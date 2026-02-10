const WithdrawModel = require("../models/withdraw.model");
const { ShopModel } = require("../models/shop.model");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const sendVerficationEmail = require("../utils/SendVerificationEmail");

// ================= SELLER CREATE WITHDRAW =================
exports.createWithdrawRequest = CatchAsyncError(async (req, res, next) => {
  const { amount } = req.body;

  if (amount <= 0) {
    return next(new ErrorHandler("Invalid withdraw amount", 400));
  }

  const seller = await ShopModel.findById(req.seller._id);

  if (seller.availableBalance < amount) {
    return next(
      new ErrorHandler("Insufficient available balance", 400)
    );
  }

  const withdraw = await WithdrawModel.create({
    seller: req.seller,
    amount,
  });

  seller.availableBalance -= amount;
  await seller.save();

  await sendVerficationEmail({
    email: seller.email,
    subject: "Withdraw Request",
    message: `Hello ${seller.name}, your withdraw request of $${amount} is being processed. It usually takes 3–7 business days.`,
  });

  res.status(201).json({
    success: true,
    withdraw,
  });
});

// ================= ADMIN GET ALL WITHDRAWS =================
exports.adminGetAllWithdrawRequests = CatchAsyncError(async (req, res) => {
  const withdraws = await WithdrawModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    withdraws,
  });
});

// ================= ADMIN UPDATE WITHDRAW =================
exports.adminUpdateWithdrawRequest = CatchAsyncError(
  async (req, res, next) => {
    const { sellerId } = req.body;

    const withdraw = await WithdrawModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "succeed",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!withdraw) {
      return next(new ErrorHandler("Withdraw request not found", 404));
    }

    const seller = await ShopModel.findById(sellerId);

    seller.transections.push({
      _id: withdraw._id,
      amount: withdraw.amount,
      updatedAt: withdraw.updatedAt,
      status: withdraw.status,
    });

    await seller.save();

    await sendVerficationEmail({
      email: seller.email,
      subject: "Payment confirmation",
      message: `Hello ${seller.name}, your withdraw request of $${withdraw.amount} has been approved and is on the way. Processing time is typically 3–7 business days.`,
    });

    res.status(200).json({
      success: true,
      withdraw,
    });
  }
);
