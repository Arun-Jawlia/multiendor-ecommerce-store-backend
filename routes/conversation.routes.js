const express = require("express");
const {
  createConversation,
  getSellerConversations,
  getUserConversations,
  updateLastMessage,
} = require("../controllers/conversation.controllers");

const {
  isSellerAuthenticated,
  isAuthenticated,
} = require("../middleware/auth");

const router = express.Router();

// CREATE / START CONVERSATION
router.post(
  "/create-new-conversation",
  createConversation
);

// SELLER CONVERSATIONS
router.get(
  "/get-all-seller-conversations/:id",
  isSellerAuthenticated,
  getSellerConversations
);

// USER CONVERSATIONS
router.get(
  "/get-all-user-conversations/:id",
  isAuthenticated,
  getUserConversations
);

// UPDATE LAST MESSAGE
router.put(
  "/update-last-conversation-message/:id",
  updateLastMessage
);

module.exports = router;
