const express = require("express");
const {
  isSellerAuthenticated,
  isAdmin,
  isAuthenticated,
} = require("../middleware/auth");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const WithdrawModel = require("../models/withdraw.model");
const sendVerficationEmail = require("../utils/SendVerificationEmail");
const { ShopModel } = require("../models/shop.model");
const ErrorHandler = require("../utils/ErrorHandler");
const WithdrawRouter = express.Router();

// CREATE WITHDRAW REQUEST BY SELLER
WithdrawRouter.post(
  "/create-withdraw-request",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { amount } = req.body;

      const data = {
        seller: req.seller,
        amount: amount,
      };
      try {
        await sendVerficationEmail({
          email: req.seller.email,
          subject: "Withdraw Request",
          message: `Hello ${req.seller.name}, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `,
        });
        res.status(201).json({
          success: true,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      const withdraw = await WithdrawModel.create(data);
      const shop = await ShopModel.findById(req.seller._id);

      shop.availableBalance = shop.availableBalance - amount;

      await shop.save();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ==========================GET ALL WITHDRAW REQUEST BY ADMIN ========================
WithdrawRouter.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const withdraws = await WithdrawModel.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ================================ APPROVE OR UPDATE WITHDRAW REQUEST ===========================
WithdrawRouter.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      const withdraw = await WithdrawModel.findByIdAndUpdate(
        req.params.id,
        {
          status: "succeed",
          updatedAt: Date.now(),
        },
        { new: true }
      );

      const seller = await ShopModel.findById(sellerId);

      const transection = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      seller.transections = [...seller.transections, transection];

      await seller.save();

      try {
        await sendVerficationEmail({
          email: seller.email,
          subject: "Payment confirmation",
          message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = WithdrawRouter;
