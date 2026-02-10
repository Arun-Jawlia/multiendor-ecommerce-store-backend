const express = require("express");
const upload = require("../multer");
const {
  createShop,
  activateShop,
  loginShop,
  getSeller,
  logoutSeller,
  getShopInfo,
  updateShopAvatar,
  updateSellerInfo,
  adminGetAllSellers,
  adminDeleteSeller,
  updateWithdrawMethod,
  deleteWithdrawMethod,
} = require("../controllers/shop.controllers");

const {
  isAuthenticated,
  isSellerAuthenticated,
  isAdmin,
} = require("../middleware/auth");

const router = express.Router();

// REGISTER SHOP
router.post(
  "/create-shop",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  createShop
);

// ACTIVATE SHOP
router.post("/shop-activation", activateShop);

// LOGIN
router.post("/login-shop", loginShop);

// CURRENT SELLER
router.get("/getSeller", isSellerAuthenticated, getSeller);

// LOGOUT
router.get("/logout", logoutSeller);

// PUBLIC SHOP INFO
router.get("/get-shop-info/:id", getShopInfo);

// UPDATE AVATAR
router.put(
  "/update-shop-avatar",
  isSellerAuthenticated,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateShopAvatar
);

// UPDATE SHOP INFO
router.put(
  "/update-seller-info",
  isSellerAuthenticated,
  updateSellerInfo
);

// ADMIN
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllSellers
);

router.delete(
  "/delete-seller-by-admin/:id",
  isAuthenticated,
  isAdmin("Admin"),
  adminDeleteSeller
);

// WITHDRAW METHODS
router.put(
  "/update-payment-method",
  isSellerAuthenticated,
  updateWithdrawMethod
);

router.delete(
  "/delete-withdraw-method",
  isSellerAuthenticated,
  deleteWithdrawMethod
);

module.exports = router;
