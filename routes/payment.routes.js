const express = require("express");
const {
  processPayment,
  getStripeApiKey,
} = require("../controllers/payment.controllers");

const router = express.Router();

// PAYMENT
router.post("/payment-process", processPayment);

// STRIPE PUBLIC KEY
router.get("/get/stripeapikey", getStripeApiKey);

module.exports = router;
