const MessageModel = require("../models/message.model");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const cloudinary = require("cloudinary");

// ================= CREATE MESSAGE =================
exports.createMessage = CatchAsyncError(async (req, res, next) => {
  const { sender, conversationId, text, images } = req.body;

  let imageData;

  if (images) {
    const uploaded = await cloudinary.v2.uploader.upload(images, {
      folder: "messages",
    });

    imageData = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  const message = await MessageModel.create({
    sender,
    conversationId,
    text,
    images: imageData,
  });

  res.status(201).json({
    success: true,
    message,
  });
});

// ================= GET ALL MESSAGES =================
exports.getAllMessages = CatchAsyncError(async (req, res, next) => {
  const messages = await MessageModel.find({
    conversationId: req.params.id,
  });

  res.status(200).json({
    success: true,
    messages,
  });
});
