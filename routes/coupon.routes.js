const express = require("express");
const {
  createCoupon,
  getSellerCoupons,
  deleteCoupon,
  getCouponByName,
} = require("../controllers/coupon.controllers");

const { isSellerAuthenticated } = require("../middleware/auth");

const router = express.Router();

// CREATE COUPON
router.post(
  "/create-coupon",
  isSellerAuthenticated,
  createCoupon
);

// GET ALL COUPONS OF SELLER
router.get(
  "/get-all-coupons/:id",
  isSellerAuthenticated,
  getSellerCoupons
);

// DELETE COUPON
router.delete(
  "/delete-coupon/:id",
  isSellerAuthenticated,
  deleteCoupon
);

// GET COUPON BY NAME (PUBLIC)
router.get(
  "/get-coupon-value/:name",
  getCouponByName
);

module.exports = router;
