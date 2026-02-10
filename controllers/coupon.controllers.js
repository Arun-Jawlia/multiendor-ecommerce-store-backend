const CouponModel = require("../models/coupon.model");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");

// ================= CREATE COUPON =================
exports.createCoupon = CatchAsyncError(async (req, res, next) => {
  const { name } = req.body;

  const existingCoupon = await CouponModel.findOne({ name });
  if (existingCoupon) {
    return next(new ErrorHandler("Coupon code already exists!", 400));
  }

  const couponCode = await CouponModel.create({
    ...req.body,
    shopId: req.seller.id,
  });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    couponCode,
  });
});

// ================= GET SELLER COUPONS =================
exports.getSellerCoupons = CatchAsyncError(async (req, res) => {
  const couponCodes = await CouponModel.find({
    shopId: req.seller.id,
  });

  res.status(200).json({
    success: true,
    couponCodes,
  });
});

// ================= DELETE COUPON =================
exports.deleteCoupon = CatchAsyncError(async (req, res, next) => {
  const couponCode = await CouponModel.findByIdAndDelete(req.params.id);

  if (!couponCode) {
    return next(new ErrorHandler("Coupon code doesn't exist!", 404));
  }

  res.status(200).json({
    success: true,
    message: "Coupon code deleted successfully!",
  });
});

// ================= GET COUPON BY NAME =================
exports.getCouponByName = CatchAsyncError(async (req, res, next) => {
  const couponCode = await CouponModel.findOne({
    name: req.params.name,
  });

  if (!couponCode) {
    return next(new ErrorHandler("Invalid coupon code", 404));
  }

  res.status(200).json({
    success: true,
    couponCode,
  });
});
