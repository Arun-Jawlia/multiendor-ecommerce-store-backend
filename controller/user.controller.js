const express = require("express");
const jwt = require("jsonwebtoken");
const upload = require("../multer");
const {
  userModel,
  hashPassword,
  comparePassword,
} = require("../models/user.model");
const ErrorHandler = require("../utils/ErrorHandler");
const UserRouter = express.Router();
const fs = require("fs");
const sendVerficationEmail = require("../utils/SendVerificationEmail");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const sendToken = require("../utils/SendToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const generator = require("generate-password");
const cloudinary = require("cloudinary");
const ENUM = require("../config/ENUM");
const uploadOnCloudinary = require("../utils/Cloudinary");

// ===================|| REGISTER USER ||============================
UserRouter.post(
  "/create-user",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      console.log(req.body);
      if ([name, email, password].some((field) => field?.trim() === "")) {
        return next(new ErrorHandler("All Fields Required", 400));
      }

      const userEmail = await userModel.findOne({ email });
      if (userEmail) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const avatarLocalPath = req?.files?.avatar[0]?.path;

      if (!avatarLocalPath) {
        return next(new ErrorHandler("Avatar is required", 400));
      }

      const avatar = await uploadOnCloudinary(
        avatarLocalPath,
        ENUM.CLOUDINARY_AVATAR
      );

      const hashedPassword = await hashPassword(password);
      const user = new userModel({
        email,
        name,
        password: hashedPassword,
        avatar: {
          public_id: avatar.public_id,
          url: avatar.secure_url,
        },
      });

      const activationToken = createActivationToken(user);

      const activationURL = `http://localhost:3000/activation/${activationToken}`;
      // const activationURL = `https://multivendor-ecommerce-store.vercel.app/activation/${activationToken}`;

      // Log email details before sending
      const emailDetails = {
        email: user.email,
        subject: `Activate your account`,
        message: `Hello ${user.name}, Please click on the link to activate your account: ${activationURL}`,
      };

      try {
        await sendVerficationEmail(emailDetails);

        res.status(201).json({
          success: true,
          message: `Please check your email ${user.email} to activate your account`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// =====================|| ACTIVATION TOKEN ||=====================
const createActivationToken = (user) => {
  const userDetails = {
    user,
  };
  return jwt.sign(userDetails, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// =====================|| SAVE USER BY ACTIVATION TOKEN ||=====================
UserRouter.post(
  "/activation",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newUser) {
        return next(new ErrorHandler("Invalid Token", 400));
      }

      const { name, email, password, avatar } = newUser?.user;
      let user = await userModel.findOne({ email });

      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      user = await userModel.create({
        name,
        email,
        avatar,
        password,
        verified: true,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================|| lOGIN AND VERIFY BY AZURE ||============================
UserRouter.post(
  "/azure-authentication",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { name, email } = req.body;

      const existUser = await userModel.findOne({ email });
      const generatedPassword = generator.generate({
        length: 20,
        numbers: true,
      });

      if (existUser) {
        sendToken(existUser, 201, res);
      }

      if (!existUser) {
        const hashedPassword = await hashPassword(generatedPassword);
        const user = new userModel({
          name,
          email,
          password: hashedPassword,
          isAzure: true,
          verified: true,
        });

        await user.save();

        const { password, ...otherDetails } = user?._doc;
        sendToken(otherDetails, 201, res);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================|| LOGIN USER ||============================

UserRouter.post(
  "/login-user",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email || !req.body.password) {
        return next(new ErrorHandler("Please provide the all fields", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (user && user.isAzure) {
        return next(new ErrorHandler("User logged in with Azure!", 400));
      }

      if (!user) {
        return next(new ErrorHandler("User not found!", 400));
      }

      if (!user.verified) {
        return next(
          new ErrorHandler(
            "Your account is not activate. Please check your email!",
            400
          )
        );
      }
      const isValidPassword = await comparePassword(
        req.body.password,
        user?.password
      );
      if (!isValidPassword) {
        return next(new ErrorHandler("Invalid Credentials!", 400));
      }

      const { password, ...otherDetails } = user?._doc;

      sendToken(otherDetails, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================|| GET USER BY TOKEN  ||============================

UserRouter.get(
  "/getUser",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return next(new ErrorHandler("User not found!", 400));
      }
      res
        .status(200)
        .json({ success: true, user: user, message: "User found" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || LOGOUT USER ||=============================================
UserRouter.get(
  "/logout",
  CatchAsyncError(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res
        .status(200)
        .json({ success: true, message: "User Logout successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || UPDATE USER INFO ||=============================================
UserRouter.put(
  "/update-user-info",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { email, phoneNumber, name, userId } = req.body;
      const user = await userModel.findOne({ email }).select("+password");

      if (userId !== req.user.id) {
        return next(new ErrorHandler("Unauthorised to change!", 400));
      } else {
        if (!user) {
          return next(new ErrorHandler("User not found!", 400));
        }
        // const validatePassword = await comparePassword(password, user?.password);

        // if (!validatePassword) {
        //   return next(new ErrorHandler("Please provide correct password!", 400));
        // }

        user.name = name;
        user.email = email;
        user.phoneNumber = phoneNumber;

        await user.save();

        res.status(201).json({
          success: true,
          message: "User Info Updated successfully",
          user: user,
        });
      }
      res.status(201).json({
        success: true,
        message: "User Info Updated successfully",
        user: user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || UPDATE USER AVATAR ||=============================================
UserRouter.put(
  "/update-user-avatar",
  isAuthenticated,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  CatchAsyncError(async (req, res, next) => {
    try {
      const id = req.user.id ? req.user.id : req.user._id;
      const existUser = await userModel.findById(id);

      if (req.body.avatar !== "") {
        const imageId = existUser.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);

        const avatarLocalPath = req.body.avatar;
        if (!avatarLocalPath) {
          return next(new ErrorHandler("Avatar is required", 400));
        }

        const avatar = await uploadOnCloudinary(
          avatarLocalPath,
          ENUM.CLOUDINARY_AVATAR
        );

        existUser.avatar = {
          public_id: avatar.public_id,
          url: avatar.secure_url,
        };
        await existUser.save();
        res.status(200).json({
          success: true,
          message: "User Avatar Updated successfully",
          user: existUser,
        });
      } else {
        return next(new ErrorHandler("Please Select Avatar!", 400));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || UPDATE USER ADDRESS ||=============================================
UserRouter.put(
  "/update-user-address",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return next(new ErrorHandler("User not found!", 400));
      }

      const sameTypeAddress = user?.addresses?.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(
            `${req.body.addressType} address already exists`,
            400
          )
        );
      }

      const existsAddress = user?.addresses?.find(
        (address) => address._id === req.body._id
      );
      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || DELETE USER ADDRESS ||=============================================
UserRouter.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await userModel.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await userModel.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//  ============================== || CHANGE USER PASSWORD ||=============================================
UserRouter.put(
  "/change-user-password",
  isAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id).select("+password");
      if (!user) {
        return next(new ErrorHandler("User not found!", 400));
      }

      const isPasswordMatched = await comparePassword(
        req.body.oldPassword,
        user.password
      );
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is not matched!", 400));
      }

      const hashedPassword = await hashPassword(req.body.newPassword);

      user.password = hashedPassword;

      await user.save();
      res
        .status(200)
        .send({ message: "Password Updated successfully", user: user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
//  ============================== || GET USER BY USERID ||=============================================
UserRouter.get(
  "/get-user-info/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        return next(new ErrorHandler("User not found!", 400));
      }

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =============================== GET ALL USERS BY ADMIN ============================
UserRouter.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const users = await userModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =============================== DELETE USER BY ADMIN ============================
UserRouter.delete(
  "/delete-user-by-admin/:id",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }

      const imageId = user.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      await userModel.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = UserRouter;
