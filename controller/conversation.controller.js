const express = require("express");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const Conversation = require("../models/conversation.model");
const { isSellerAuthenticated, isAuthenticated } = require("../middleware/auth");
const ConversationRouter = express.Router();


// ====================|| CREATE CONVERSATION OR START MESSAGING ||================
ConversationRouter.post(
  "/create-new-conversation",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { groupTitle, userId, sellerId } = req.body;
      const isConversationExist = await Conversation.findOne({ groupTitle });

      if (isConversationExist) {
        const conversation = isConversationExist;
        res.status(201).json({ success: true, conversation });
      } else {
        const conversation = await Conversation.create({
          members: [userId, sellerId],
          groupTitle: groupTitle,
        });

        res.status(201).json({ success: true, conversation });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//===========================|| GET ALL SELLER CONVERSATIONS ||========================= 
ConversationRouter.get(
  "/get-all-seller-conversations/:id",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =============================|| USER CONVERSATION ||================================
ConversationRouter.get(
  "/get-all-user-conversations/:id",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error), 500);
    }
  })
);

// =======================|| UPDATE LAST MESSAGE ||=====================================
ConversationRouter.put(
  "/update-last-conversation-message/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { lastMessage, lastMessageId } = req.body;
      const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
        lastMessage,
        lastMessageId,
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// Get the last messages
ConversationRouter.put(
  "/get-all-message/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { lastMessage, lastMessageId } = req.body;
      const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
        lastMessage,
        lastMessageId,
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = ConversationRouter;
