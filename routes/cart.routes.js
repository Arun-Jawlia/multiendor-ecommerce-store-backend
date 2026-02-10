const express = require("express");
const {
  addToCart,
  getUserCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart.controllers");

const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// ADD ITEM TO CART
router.post("/add-to-cart", isAuthenticated, addToCart);

// GET USER CART
router.get("/get-cart", isAuthenticated, getUserCart);

// UPDATE ITEM QTY
router.put("/update-cart-item", isAuthenticated, updateCartItem);

// REMOVE ITEM
router.delete("/remove-cart-item/:productId", isAuthenticated, removeCartItem);

// CLEAR CART (after order)
router.delete("/clear-cart", isAuthenticated, clearCart);

module.exports = router;
