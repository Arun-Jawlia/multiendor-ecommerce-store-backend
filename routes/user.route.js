const express = require("express");
const upload = require("../multer");
const {
  CreateUser,
  UserActivation,
  AzureAuthentication,
  LoginUser,
  GetUser,
} = require("../controller/user.controller");
const { isAuthenticated } = require("../middleware/auth");
const UserRouter = express.Router();

UserRouter.post("/create-user", upload.single("file"), CreateUser);
UserRouter.post("/activation", UserActivation);
UserRouter.post("/azure-authentication", AzureAuthentication);
UserRouter.post("/login-user", LoginUser);
UserRouter.get("/getUser", isAuthenticated, GetUser);
UserRouter.get("/logout", LogoutUser);
UserRouter.put("/update-user-info", isAuthenticated, UpdateUserInfo);
UserRouter.put(
  "/update-user-avatar",
  isAuthenticated,
  upload.single("image"),
  UpdateUserAvatar
);

// module.exports = UserRouter