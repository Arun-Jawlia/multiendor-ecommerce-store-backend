const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

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

app.use(express.json());
app.use(cookieParser());
app.use("/", (req, res) => {
  res.send("Hello world this is my multivendor ecommerce store");
});
// app.use("/", express.static(path.join(__dirname, "./uploads")))
app.use(
  cors({
    origin: "https://multivendor-ecommerce-store.vercel.app",
    credentials: true,
  })
);
// app.use(passport.initialize())
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}
app.use("/api/v2/user", UserRouter);
app.use("/api/v2/shop", ShopRouter);
app.use("/api/v2/product", ProductRouter);
app.use("/api/v2/event", EventRouter);
app.use("/api/v2/coupon", CouponRouter);
app.use("/api/v2/payment", PaymentRouter);
app.use("/api/v2/order", OrderRouter);
app.use("/api/v2/conversation", ConversationRouter);
app.use("/api/v2/message", MessageRouter);
app.use("/api/v2/withdraw", WithdrawRouter);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
