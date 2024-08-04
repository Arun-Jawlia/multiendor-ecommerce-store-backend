const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

// Routes
const ShopRouter = require("./controller/shop.controller");
const ProductRouter = require("./controller/product.controller");
const EventRouter = require("./controller/event.controller");
const CouponRouter = require("./controller/coupon.controller");
const PaymentRouter = require("./controller/payment.controller");
const OrderRouter = require("./controller/order.controller");
const ConversationRouter = require("./controller/conversation.controller");
const MessageRouter = require("./controller/message.controller");
const WithdrawRouter = require("./controller/withdraw.controller");
const UserRouter = require("./controller/user.controller");

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
