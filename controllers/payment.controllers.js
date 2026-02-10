const CatchAsyncError = require("../middleware/CatchAsyncError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ================= PAYMENT PROCESS =================
exports.processPayment = CatchAsyncError(async (req, res) => {
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
  });

  res.status(201).json({
    success: true,
    message: "Payment successful",
    client_secret: paymentIntent.client_secret,
  });
});

// ================= GET STRIPE API KEY =================
exports.getStripeApiKey = CatchAsyncError(async (req, res) => {
  res.status(200).json({
    stripeApikey: process.env.STRIPE_API_KEY,
  });
});
