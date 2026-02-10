const express = require("express");
const {
  createMessage,
  getAllMessages,
} = require("../controllers/message.controllers");

const router = express.Router();

// CREATE MESSAGE
router.post(
  "/create-new-message",
  createMessage
);

// GET ALL MESSAGES BY CONVERSATION
router.get(
  "/get-all-messages/:id",
  getAllMessages
);

module.exports = router;
