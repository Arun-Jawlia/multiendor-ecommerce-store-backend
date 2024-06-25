const express = require("express");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const EventRouter = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const { ShopModel } = require("../models/shop.model");
const ProductModel = require("../models/product.model");
const upload = require("../multer");
const {
  isSellerAuthenticated,
  isAdmin,
  isAuthenticated,
} = require("../middleware/auth");
const EventModel = require("../models/event.model");
const fs = require("fs");
const cloudinary = require("cloudinary");
const ENUM = require("../config/ENUM");

// ======================|| CREATE EVENT ||================================
EventRouter.post(
  "/create-event",
  CatchAsyncError(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await ShopModel.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is not valid!", 400));
      } else {
        let images = [];

        if (typeof req.body.images === "string") {
          images.push(req.body.body);
        } else {
          images = req.body.images;
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: ENUM.CLOUDINARY_PRODUCT,
          });
          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        const eventData = req.body;
        eventData.images = imagesLinks;
        eventData.shop = shop;

        const event = await EventModel.create(eventData);
        res
          .status(201)
          .json({ success: true, message: "Event Added", event: event });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// ======================|| GET ALL EVENTS ||================================
EventRouter.get(
  "/get-all-events/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const events = await EventModel.find({ shopId: req.params.id });
      res
        .status(201)
        .json({ success: true, message: "Events Found", event: events });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// ======================|| DELETE EVENT BY SELLER  ||================================
EventRouter.delete(
  "/delete-event/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const eventId = req.params.id;
      const eventData = await EventModel.findById(eventId);
      
      if (!eventData) {
        return next(new ErrorHandler("Event is not found with this id", 404));
      }
      
      for (let i = 0; 1 < eventData.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(
          event.images[i].public_id
        );
      }
      
      const event = await EventModel.findByIdAndDelete(eventId);
      res
      .status(201)
      .json({ success: true, message: " Event Deleted Successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// ======================|| GET ALL EVENT  ||================================
EventRouter.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await EventModel.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// ======================|| GET ALL EVENT BY ADMIN  ||================================
EventRouter.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const events = await EventModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = EventRouter;
