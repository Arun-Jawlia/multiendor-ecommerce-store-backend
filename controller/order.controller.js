const express = require("express");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const {
  isAuthenticated,
  isSellerAuthenticated,
  isAdmin,
} = require("../middleware/auth");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const ErrorHandler = require("../utils/ErrorHandler");
const { ShopModel } = require("../models/shop.model");
const ENUM = require("../config/ENUM");
const OrderRouter = express.Router();

// ==================================== || CREATE ORDER ||======================================
OrderRouter.post(
  "/create-order",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
      //   group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await OrderModel.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =====================================|| GET ORDER BY USER ID - USER ORDER ||=====================================
OrderRouter.get(
  "/get-all-orders/:userId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const orders = await OrderModel.find({
        "user._id": req.params.userId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =====================================|| GET ORDER BY SELLER ID - SELLER ORDER ||=====================================
OrderRouter.get(
  "/get-seller-all-orders/:shopId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const orders = await OrderModel.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// =====================================|| UPDATE ORDER STATUS - SELLER ORDER ||=====================================
OrderRouter.put(
  "/update-order-status/:id",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const id = req.params.id;

      const order = await OrderModel.findById(id);
      if (!order) {
        return next(new ErrorHandler("Order not found with Id", 400));
      }

      if (req.body.status === ENUM.ORDER_STATUS.TRANSFER_TO_DELIVERY_PARTNER) {
        order?.cart?.forEach(
          async (item) => await updateOrder(item?._id, item.qty)
        );
      }

      order.status = req.body.status;

      if (req.body.status === ENUM.ORDER_STATUS.DELIVERED) {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = ENUM.ORDER_STATUS.SUCCEEDED;
        const serviceCharge = order.totalPrice * 0.1;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        message: "Order saved successfully",
        success: true,
        order: order,
      });

      async function updateOrder(id, qty) {
        const product = await ProductModel.findById(id);

        product.stock -= qty;
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await ShopModel.findById(req.seller._id);

        seller.availableBalance = amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =====================================|| POST REFUND ORDER BY USER TO SELLER  ||=====================================
OrderRouter.put(
  "/order-refund/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const id = req.params.id;

      const order = await OrderModel.findById(id);

      if (!order) {
        return next(new ErrorHandler("Order not found with Id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        message: "Order refund request successfully",
        success: true,
        order: order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =====================================|| ACCEPT THE REFUND ||=====================================
OrderRouter.put(
  "/order-refund-success/:id",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const id = req.params.id;

      const order = await OrderModel.findById(id);

      if (!order) {
        return next(new ErrorHandler("Order not found with Id", 400));
      }

      order.status = req.body.status;

      await order.save();

      if (req.body.status === ENUM.ORDER_STATUS.REFUND_SUCCESS) {
        order?.cart?.forEach(
          async (item) => await updateOrder(item?._id, item.qty)
        );
      }
      async function updateOrder(id, qty) {
        const product = await ProductModel.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }

      res.status(200).json({
        message: "Order refund request accept successfully",
        success: true,
        order: order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// =====================================|| ADMIN ORDERS ||=====================================
OrderRouter.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const orders = await OrderModel.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = OrderRouter;
