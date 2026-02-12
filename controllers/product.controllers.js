const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const cloudinary = require("cloudinary");

const { ShopModel } = require("../models/shop.model");
const ProductModel = require("../models/product.model");
const OrderModel = require("../models/order.model");

const uploadOnCloudinary = require("../utils/Cloudinary");
const ENUM = require("../config/ENUM");

// ================= CREATE PRODUCT =================
exports.createProduct = CatchAsyncError(async (req, res, next) => {
  const sellerId = req.seller?.id;

  if (!sellerId) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  const shop = await ShopModel.findById(sellerId);
  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("Product images are required", 400));
  }

  // ⚡ Parallel image uploads
  const imagesLinks = await Promise.all(
    req.files.map(async (file) => {
      const result = await uploadOnCloudinary(
        file.path,
        ENUM.CLOUDINARY_PRODUCT
      );

      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    })
  );

  const product = await ProductModel.create({
    ...req.body,
    images: imagesLinks,
    shopId: shop._id,        // ✅ reference only     // optional but useful
  });

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    product,
  });
});


// ================= GET SHOP PRODUCTS =================
exports.getShopProducts = CatchAsyncError(async (req, res) => {
  const products = await ProductModel.find({
    shopId: req.params.id,
  });

  res.status(200).json({
    success: true,
    products,
  });
});

// ================= DELETE PRODUCT =================
exports.deleteProduct = CatchAsyncError(async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // delete images from cloudinary
  for (const img of product.images) {
    await cloudinary.v2.uploader.destroy(img.public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Deleted Successfully",
  });
});

// ================= GET ALL PRODUCTS =================
exports.getAllProducts = CatchAsyncError(async (req, res) => {
  const products = await ProductModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    products,
  });
});

// ================= CREATE REVIEW =================
exports.createReview = CatchAsyncError(async (req, res, next) => {
  const { rating, comment, productId, orderId } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const existingReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      rating,
      comment,
    });
  }

  product.ratings =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  await OrderModel.findByIdAndUpdate(
    orderId,
    { $set: { "cart.$[elem].isReviewed": true } },
    { arrayFilters: [{ "elem.product": productId }] }
  );

  res.status(200).json({
    success: true,
    message: "Reviewed successfully",
  });
});

// ================= ADMIN ALL PRODUCTS =================
exports.adminGetAllProducts = CatchAsyncError(async (req, res) => {
  const products = await ProductModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    products,
  });
});
