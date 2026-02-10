const express = require("express");
const {
  createWithdrawRequest,
  adminGetAllWithdrawRequests,
  adminUpdateWithdrawRequest,
} = require("../controllers/withdraw.controllers");

const {
  isSellerAuthenticated,
  isAuthenticated,
  isAdmin,
} = require("../middleware/auth");

const router = express.Router();

// SELLER – CREATE WITHDRAW REQUEST
router.post(
  "/create-withdraw-request",
  isSellerAuthenticated,
  createWithdrawRequest
);

// ADMIN – GET ALL WITHDRAW REQUESTS
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllWithdrawRequests
);

// ADMIN – UPDATE / APPROVE WITHDRAW REQUEST
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  adminUpdateWithdrawRequest
);

module.exports = router;
