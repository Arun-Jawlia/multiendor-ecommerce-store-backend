const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

// Routes
const UserRouter = require("./routes/user.routes");
const ShopRouter = require("./routes/shop.routes");
const ProductRouter = require("./routes/product.routes");
const EventRouter = require("./routes/events.routes");
const CouponRouter = require("./routes/coupon.routes");
const PaymentRouter = require("./routes/payment.routes");
const OrderRouter = require("./routes/order.routes");
const ConversationRouter = require("./routes/conversation.routes");
const MessageRouter = require("./routes/message.routes");
const WithdrawRouter = require("./routes/withdraw.routes");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}
// Middleware configuration
app.use(express.json())
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "./uploads")))
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Routes 
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/shop", ShopRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/event", EventRouter);
app.use("/api/v1/coupon", CouponRouter);
app.use("/api/v1/payment", PaymentRouter);
app.use("/api/v1/order", OrderRouter);
app.use("/api/v1/conversation", ConversationRouter);
app.use("/api/v1/message", MessageRouter);
app.use("/api/v1/withdraw", WithdrawRouter);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
