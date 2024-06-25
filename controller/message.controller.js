const express = require("express");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const MessageModel = require("../models/message.model");
const MessageRouter = express.Router();
const cloudinary = require("cloudinary");

// =======================|| CREATE MESSAGE ||======================================
MessageRouter.post(
  "/create-new-message",
  CatchAsyncError(async (req, res, next) => {
    try {
      const messageData = req.body;
      
      if (req.body.images) {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.images, {
          folder: "messages",
        });
        messageData.images = {
          public_id: myCloud.public_id,
          url: myCloud.url,
        };
      }
      const message = new MessageModel({
        sender: messageData.sender,
        conversationId: messageData.conversationId,
        text: messageData.text,
        images: messageData.images ? messageData.images : undefined,
      });
      
      await message.save();
      res.status(201).json({ success: true, message });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =======================|| GET LL MESSAGE ||======================================
MessageRouter.get(
    "/get-all-messages/:id",
    CatchAsyncError(async (req, res, next) => {
      try {
        const messages = await MessageModel.find({
          conversationId: req.params.id,
        });
  
        res.status(201).json({
          success: true,
          messages,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message), 500);
      }
    })
  );
  

module.exports = MessageRouter;
