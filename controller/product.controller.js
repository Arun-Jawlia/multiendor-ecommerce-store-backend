const express = require("express");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const ProductRouter = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const { ShopModel } = require("../models/shop.model");
const ProductModel = require("../models/product.model");
const upload = require("../multer");
const {
  isSellerAuthenticated,
  isAuthenticated,
  isAdmin,
} = require("../middleware/auth");
const fs = require("fs");
const OrderModel = require("../models/order.model");
const cloudinary = require("cloudinary");
const ENUM = require("../config/ENUM");
const uploadOnCloudinary = require("../utils/Cloudinary");

// ======================|| CREATE PRODUCT ||================================
ProductRouter.post(
  "/create-product",
  upload.array('images',5),
  CatchAsyncError(async (req, res, next) => {
    try {
      console.log('Create Product', req.body), req.files
      const shopId = req.body.shopId;
      const shop = await ShopModel.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is not valid!", 400));
      } else {
        let images = req.files.map(file => file.path); 

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
          const result = await uploadOnCloudinary(
            images[i],
            ENUM.CLOUDINARY_PRODUCT
          );

          // await cloudinary.v2.uploader.upload(images[i], {
          //   folder: ENUM.CLOUDINARY_PRODUCT,
          // });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
        const productData = req.body;
        productData.images = imagesLinks;
        productData.shop = shop;

        const product = await ProductModel.create(productData);

        res
          .status(201)
          .json({ success: true, message: "Product Added", product: product });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// ======================|| GET ALL PRODUCTS ||================================
ProductRouter.get(
  "/get-all-products/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const products = await ProductModel.find({ shopId: req.params.id });
      res
        .status(201)
        .json({ success: true, message: "Product Added", products: products });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// ======================|| DELETE PRODUCTS BY SELLER ID ||================================
ProductRouter.delete(
  "/delete-shop-products/:id",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const productData = await ProductModel.findById(productId);
      if (!productData) {
        return next(new ErrorHandler("Product not found", 400));
      }
      for (let i = 0; 1 < productData.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(
          productData.images[i].public_id
        );
      }

      await ProductModel.findByIdAndDelete(productId);

      res.status(201).json({ success: true, message: "Deleted Successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

//
// ======================|| GET ALL PRODUCTS  ||================================

// get all products
ProductRouter.get(
  "/get-all-products",
  CatchAsyncError(async (req, res, next) => {
    try {
      const products = await ProductModel.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ======================|| ADD REVIEW ||================================

ProductRouter.put(
  "/create-new-review",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const product = await ProductModel.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product Not found with this id", 400));
      }

      const review = {
        user,
        rating,
        comment,
        productId,
      };
      const isReviewed = product.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        product?.reviews?.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await OrderModel.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Reviwed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ======================|| GET ALL PRODUCTS FOR ADMIN  ||================================
ProductRouter.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const products = await ProductModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
module.exports = ProductRouter;
