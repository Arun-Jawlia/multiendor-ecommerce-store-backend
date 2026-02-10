const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const { ShopModel } = require("../models/shop.model");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const ENUM = require("../config/ENUM");

// ================= CREATE ORDER (FROM CART) =================
exports.createOrder = CatchAsyncError(async (req, res, next) => {
  const { shippingAddress, paymentInfo } = req.body;

  // 1. Get cart from DB
  const cartDoc = await CartModel.findOne({ userId: req.user._id });

  if (!cartDoc || cartDoc.items.length === 0) {
    return next(new ErrorHandler("Cart is empty", 400));
  }

  const cartItems = cartDoc.items;

  // 2. Group cart items by shopId
  const shopItemsMap = new Map();

  for (const item of cartItems) {
    const shopId = item.shopId.toString();

    if (!shopItemsMap.has(shopId)) {
      shopItemsMap.set(shopId, []);
    }

    shopItemsMap.get(shopId).push(item);
  }

  const orders = [];

  // 3. Create order per shop
  for (const [, items] of shopItemsMap) {
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const order = await OrderModel.create({
      cart: items,
      shippingAddress,
      user: req.user,
      totalPrice,
      paymentInfo,
    });

    orders.push(order);
  }

  // 4. Clear cart after successful order
  cartDoc.items = [];
  await cartDoc.save();

  res.status(201).json({
    success: true,
    orders,
  });
});


// ================= USER ORDERS =================
exports.getUserOrders = CatchAsyncError(async (req, res) => {
  const orders = await OrderModel.find({
    "user._id": req.params.userId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

// ================= SELLER ORDERS =================
exports.getSellerOrders = CatchAsyncError(async (req, res) => {
  const orders = await OrderModel.find({
    "cart.shopId": req.params.shopId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = CatchAsyncError(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (
    req.body.status ===
    ENUM.ORDER_STATUS.TRANSFER_TO_DELIVERY_PARTNER
  ) {
    for (const item of order.cart) {
      await updateProductStock(item._id, item.qty);
    }
  }

  if (req.body.status === ENUM.ORDER_STATUS.DELIVERED) {
    order.deliveredAt = Date.now();
    order.paymentInfo.status = ENUM.ORDER_STATUS.SUCCEEDED;

    const serviceCharge = order.totalPrice * 0.1;
    await updateSellerBalance(
      req.seller._id,
      order.totalPrice - serviceCharge
    );
  }

  order.status = req.body.status;
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order,
  });
});

// ================= REQUEST REFUND =================
exports.requestOrderRefund = CatchAsyncError(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  order.status = req.body.status;
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Refund requested successfully",
    order,
  });
});

// ================= ACCEPT REFUND =================
exports.acceptOrderRefund = CatchAsyncError(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  order.status = req.body.status;
  await order.save();

  if (req.body.status === ENUM.ORDER_STATUS.REFUND_SUCCESS) {
    for (const item of order.cart) {
      await restoreProductStock(item._id, item.qty);
    }
  }

  res.status(200).json({
    success: true,
    message: "Refund processed successfully",
    order,
  });
});

// ================= ADMIN ALL ORDERS =================
exports.adminGetAllOrders = CatchAsyncError(async (req, res) => {
  const orders = await OrderModel.find().sort({
    deliveredAt: -1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    orders,
  });
});

// ================= HELPERS =================
async function updateProductStock(productId, qty) {
  const product = await ProductModel.findById(productId);
  product.stock -= qty;
  product.sold_out += qty;
  await product.save({ validateBeforeSave: false });
}

async function restoreProductStock(productId, qty) {
  const product = await ProductModel.findById(productId);
  product.stock += qty;
  product.sold_out -= qty;
  await product.save({ validateBeforeSave: false });
}

async function updateSellerBalance(sellerId, amount) {
  const seller = await ShopModel.findById(sellerId);
  seller.availableBalance += amount;
  await seller.save();
}
