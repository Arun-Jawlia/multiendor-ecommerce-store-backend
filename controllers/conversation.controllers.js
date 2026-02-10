const Conversation = require("../models/conversation.model");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");

// ================= CREATE CONVERSATION =================
exports.createConversation = CatchAsyncError(async (req, res, next) => {
  const { groupTitle, userId, sellerId } = req.body;

  let conversation = await Conversation.findOne({ groupTitle });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [userId, sellerId],
      groupTitle,
    });
  }

  res.status(201).json({
    success: true,
    conversation,
  });
});

// ================= SELLER CONVERSATIONS =================
exports.getSellerConversations = CatchAsyncError(async (req, res) => {
  const conversations = await Conversation.find({
    members: { $in: [req.params.id] },
  }).sort({ updatedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    conversations,
  });
});

// ================= USER CONVERSATIONS =================
exports.getUserConversations = CatchAsyncError(async (req, res) => {
  const conversations = await Conversation.find({
    members: { $in: [req.params.id] },
  }).sort({ updatedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    conversations,
  });
});

// ================= UPDATE LAST MESSAGE =================
exports.updateLastMessage = CatchAsyncError(async (req, res, next) => {
  const { lastMessage, lastMessageId } = req.body;

  const conversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    {
      lastMessage,
      lastMessageId,
    },
    { new: true }
  );

  if (!conversation) {
    return next(new ErrorHandler("Conversation not found", 404));
  }

  res.status(200).json({
    success: true,
    conversation,
  });
});
