const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const cloudinary = require("cloudinary");

const { ShopModel } = require("../models/shop.model");
const EventModel = require("../models/event.model");
const ENUM = require("../config/ENUM");

// ================= CREATE EVENT =================
exports.createEvent = CatchAsyncError(async (req, res, next) => {
  const { shopId, images } = req.body;

  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    return next(new ErrorHandler("Shop Id is not valid!", 400));
  }

  let imageArray = [];

  if (typeof images === "string") {
    imageArray.push(images);
  } else if (Array.isArray(images)) {
    imageArray = images;
  }

  if (imageArray.length === 0) {
    return next(new ErrorHandler("Event images required", 400));
  }

  const imagesLinks = [];

  for (const img of imageArray) {
    const result = await cloudinary.v2.uploader.upload(img, {
      folder: ENUM.CLOUDINARY_PRODUCT,
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  const event = await EventModel.create({
    ...req.body,
    images: imagesLinks,
    shop,
    shopId,
  });

  res.status(201).json({
    success: true,
    message: "Event Added",
    event,
  });
});

// ================= GET SHOP EVENTS =================
exports.getShopEvents = CatchAsyncError(async (req, res) => {
  const events = await EventModel.find({
    shopId: req.params.id,
  });

  res.status(200).json({
    success: true,
    events,
  });
});

// ================= DELETE EVENT =================
exports.deleteEvent = CatchAsyncError(async (req, res, next) => {
  const event = await EventModel.findById(req.params.id);

  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  // delete images from cloudinary
  for (const img of event.images) {
    await cloudinary.v2.uploader.destroy(img.public_id);
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    message: "Event Deleted Successfully",
  });
});

// ================= GET ALL EVENTS =================
exports.getAllEvents = CatchAsyncError(async (req, res) => {
  const events = await EventModel.find();

  res.status(200).json({
    success: true,
    events,
  });
});

// ================= ADMIN ALL EVENTS =================
exports.adminGetAllEvents = CatchAsyncError(async (req, res) => {
  const events = await EventModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    events,
  });
});
