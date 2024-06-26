const express = require("express");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const PaymentRouter = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ================================= || PAYMENT ||====================================
PaymentRouter.post(
  "/payment-process",
  CatchAsyncError(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
    });
    res.status(201).json({
      message: "Payment successfull",
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

PaymentRouter.get(
  "/get/stripeapikey",
  CatchAsyncError(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

module.exports = PaymentRouter;
