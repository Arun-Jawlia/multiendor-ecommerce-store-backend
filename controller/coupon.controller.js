const express = require("express");
const CouponModel = require("../models/coupon.model");
const { isSellerAuthenticated } = require("../middleware/auth");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const CouponRouter = express.Router();

// ===================== || CREATE COUPON ||===========================
CouponRouter.post(
  "/create-coupon",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const isCoupounCodeExists = await CouponModel.find({
        name: req.body.name,
      });
      
      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }
      
      const coupounCode = await CouponModel.create(req.body);
      
      res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ===================== || GET ALL COUPON SHOP/SELLER ||===========================
// get all coupons of a shop
CouponRouter.get(
  "/get-all-coupons/:id",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const couponCodes = await CouponModel.find({ shopId: req.seller.id });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ===================== || DELETE COUPON BY SELLER SHOP/SELLER ||===========================
CouponRouter.delete(
  "/delete-coupon/:id",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const couponCode = await CouponModel.findByIdAndDelete(req.params.id);
      
      if (!couponCode) {
        return next(new ErrorHandler("Coupon code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ===================== || GET COUPON BY NAME ||===========================
CouponRouter.get(
  "/get-coupon-value/:name",
  CatchAsyncError(async (req, res, next) => {
    try {
      const couponCode = await CouponModel.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = CouponRouter;
