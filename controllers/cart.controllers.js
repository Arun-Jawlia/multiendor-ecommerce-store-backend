const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");

// ================= ADD TO CART =================
exports.addToCart = CatchAsyncError(async (req, res, next) => {
  const { productId, qty } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let cart = await CartModel.findOne({ userId: req.user._id });

  const itemData = {
    productId: product._id,
    shopId: product.shopId,
    name: product.name,
    price: product.discountPrice || product.originalPrice,
    image: product.images?.[0]?.url,
    qty: qty || 1,
  };

  if (!cart) {
    cart = await CartModel.create({
      userId: req.user._id,
      items: [itemData],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty || 1;
    } else {
      cart.items.push(itemData);
    }

    await cart.save();
  }

  res.status(200).json({
    success: true,
    cart,
  });
});

// ================= GET USER CART =================
exports.getUserCart = CatchAsyncError(async (req, res) => {
  const cart = await CartModel.findOne({ userId: req.user._id });

  res.status(200).json({
    success: true,
    cart: cart || { items: [] },
  });
});

// ================= UPDATE CART ITEM =================
exports.updateCartItem = CatchAsyncError(async (req, res, next) => {
  const { productId, qty } = req.body;

  const cart = await CartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (!item) {
    return next(new ErrorHandler("Item not found in cart", 404));
  }

  if (qty <= 0) {
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
  } else {
    item.qty = qty;
  }

  await cart.save();

  res.status(200).json({
    success: true,
    cart,
  });
});

// ================= REMOVE CART ITEM =================
exports.removeCartItem = CatchAsyncError(async (req, res) => {
  const cart = await CartModel.findOne({ userId: req.user._id });

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== req.params.productId
  );

  await cart.save();

  res.status(200).json({
    success: true,
    cart,
  });
});

// ================= CLEAR CART =================
exports.clearCart = CatchAsyncError(async (req, res) => {
  await CartModel.findOneAndUpdate(
    { userId: req.user._id },
    { items: [] }
  );

  res.status(200).json({
    success: true,
    message: "Cart cleared",
  });
});
