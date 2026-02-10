const express = require("express");
const {
  createOrder,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  requestOrderRefund,
  acceptOrderRefund,
  adminGetAllOrders,
} = require("../controllers/order.controllers");

const {
  isAuthenticated,
  isSellerAuthenticated,
  isAdmin,
} = require("../middleware/auth");

const router = express.Router();

// CREATE ORDER
router.post("/create-order", createOrder);

// USER ORDERS
router.get("/get-all-orders/:userId", getUserOrders);

// SELLER ORDERS
router.get(
  "/get-seller-all-orders/:shopId",
  isSellerAuthenticated,
  getSellerOrders
);

// UPDATE ORDER STATUS (SELLER)
router.put(
  "/update-order-status/:id",
  isSellerAuthenticated,
  updateOrderStatus
);

// REQUEST REFUND (USER)
router.put("/order-refund/:id", requestOrderRefund);

// ACCEPT REFUND (SELLER)
router.put(
  "/order-refund-success/:id",
  isSellerAuthenticated,
  acceptOrderRefund
);

// ADMIN – ALL ORDERS
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllOrders
);

module.exports = router;
