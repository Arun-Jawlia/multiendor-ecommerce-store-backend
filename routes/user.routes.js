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
} = require("../controllers/user.controllers");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// REGISTER
router.post(
  "/create-user",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  createUser
);

// ACTIVATE ACCOUNT
router.post("/activation", activateUser);

// AZURE AUTH
router.post("/azure-authentication", azureAuthentication);

// LOGIN
router.post("/login-user", loginUser);

// CURRENT USER
router.get("/getUser", isAuthenticated, getUser);

// LOGOUT
router.get("/logout", logoutUser);

// UPDATE INFO
router.put("/update-user-info", isAuthenticated, updateUserInfo);

// UPDATE AVATAR
router.put(
  "/update-user-avatar",
  isAuthenticated,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateUserAvatar
);

// ADDRESS
router.put("/update-user-address", isAuthenticated, updateUserAddress);
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  deleteUserAddress
);

// PASSWORD
router.put(
  "/change-user-password",
  isAuthenticated,
  changeUserPassword
);

// PUBLIC USER INFO
router.get("/get-user-info/:id", getUserById);

// ADMIN
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  adminGetAllUsers
);

router.delete(
  "/delete-user-by-admin/:id",
  isAuthenticated,
  isAdmin("Admin"),
  adminDeleteUser
);

module.exports = router;
