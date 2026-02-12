const express = require("express");
const upload = require("../multer");
const {
  createUser,
  activateUser,
  azureAuthentication,
  loginUser,
  getUser,
  logoutUser,
  updateUserInfo,
  updateUserAvatar,
  updateUserAddress,
  deleteUserAddress,
  changeUserPassword,
  getUserById,
  adminGetAllUsers,
  adminDeleteUser,
  addAddress
} = require("../controllers/user.controllers");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// REGISTER
router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  createUser
);

// ACTIVATE ACCOUNT
router.post("/activate-account", activateUser);

// AZURE AUTH
router.post("/azure-authentication", azureAuthentication);

// LOGIN
router.post("/login", loginUser);

// CURRENT USER
router.get("/me", isAuthenticated, getUser);

// LOGOUT
router.get("/logout", logoutUser);

// UPDATE INFO
router.put("/update-info", isAuthenticated, updateUserInfo);

// UPDATE AVATAR
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateUserAvatar
);

// ADDRESS
router.post("/address", isAuthenticated, addAddress);
router.put("/address/:id", isAuthenticated, updateUserAddress);

router.delete(
  "/address/:id",
  isAuthenticated,
  deleteUserAddress
);

// PASSWORD
router.put(
  "/change-password",
  isAuthenticated,
  changeUserPassword
);

// PUBLIC USER INFO
router.get("/get-user/:id", getUserById);

// ADMIN
router.get(
  "/admin/users",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllUsers
);

router.delete(
  "/admin/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  adminDeleteUser
);

module.exports = router;
