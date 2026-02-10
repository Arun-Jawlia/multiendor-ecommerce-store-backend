const express = require("express");
const {
  createEvent,
  getShopEvents,
  deleteEvent,
  getAllEvents,
  adminGetAllEvents,
} = require("../controllers/event.controllers");

const {
  isSellerAuthenticated,
  isAuthenticated,
  isAdmin,
} = require("../middleware/auth");

const router = express.Router();

// CREATE EVENT
router.post(
  "/create-event",
  isSellerAuthenticated,
  createEvent
);

// GET EVENTS BY SHOP
router.get("/get-all-events/:id", getShopEvents);

// DELETE EVENT
router.delete(
  "/delete-event/:id",
  isSellerAuthenticated,
  deleteEvent
);

// GET ALL EVENTS (PUBLIC)
router.get("/get-all-events", getAllEvents);

// ADMIN – ALL EVENTS
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllEvents
);

module.exports = router;
