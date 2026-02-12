const express = require("express");
const upload = require("../multer");
const {
  createProduct,
  getShopProducts,
  deleteProduct,
  getAllProducts,
  createReview,
  adminGetAllProducts,
} = require("../controllers/product.controllers");

const {
  isSellerAuthenticated,
  isAuthenticated,
  isAdmin,
} = require("../middleware/auth");

const router = express.Router();

// CREATE PRODUCT
router.post(
  "/",
  isSellerAuthenticated,
  upload.array("images", 5),
  createProduct
);

// GET PRODUCTS BY SHOP
router.get("/shop/:id", getShopProducts);

// DELETE PRODUCT
router.delete(
  "/:id",
  isSellerAuthenticated,
  deleteProduct
);

// GET ALL PRODUCTS
router.get("/get-all-products", getAllProducts);

// CREATE REVIEW
router.put(
  "/create-new-review",
  isAuthenticated,
  createReview
);

// ADMIN – ALL PRODUCTS
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllProducts
);

module.exports = router;
