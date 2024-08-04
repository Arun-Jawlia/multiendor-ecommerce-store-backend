const express = require("express");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const ShopRouter = express.Router();
const fs = require("fs");
const sendVerficationEmail = require("../utils/SendVerificationEmail");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const {
  isAuthenticated,
  isSellerAuthenticated,
  isAdmin,
} = require("../middleware/auth");
const { ShopModel } = require("../models/shop.model");
const { hashPassword, comparePassword } = require("../models/user.model");
const sendShopToken = require("../utils/SendShopToken");
const ENUM = require("../config/ENUM");
const cloudinary = require("cloudinary");
const upload = require("../multer");
const uploadOnCloudinary = require("../utils/Cloudinary");

// ===================|| CREATE SHOP OR REGISTER SHOP ||============================
ShopRouter.post(
  "/create-shop",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  async (req, res, next) => {
    try {
      const { name, email, password, phoneNumber, address, zipCode } = req.body;
      const shopEmail = await ShopModel.findOne({ email });
      if (shopEmail) {
        return next(new ErrorHandler("Seller/Shop already exists", 400));
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

      const seller = new ShopModel({
        email,
        name,
        password: hashedPassword,
        avatar: {
          public_id: avatar.public_id,
          url: avatar.secure_url,
        },
        phoneNumber,
        address,
        zipCode,
      });

      const activationToken = createActivationToken(seller);

      const activationURL = `http://localhost:3000/shop/activation/${activationToken}`;
      // const activationURL = `https://multivendor-ecommerce-store.vercel.app/shop/activation/${activationToken}`;
      try {
        await sendVerficationEmail({
          email: seller.email,
          subject: `Activate your account`,
          message: `Hello ${seller.name} , Please click on the link to activate your account : ${activationURL}`,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email ${seller.email} to activate your seller account`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// =====================|| CREATE ACTIVATION TOKEN ||=====================
const createActivationToken = (seller) => {
  const userDetails = {
    seller,
  };
  return jwt.sign(userDetails, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// ======================|| VERIFY ACTIVATE TOKEN AND SAVE SELLER ||========================
ShopRouter.post(
  "/shop-activation",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid Token", 400));
      }

      const { name, email, password, phoneNumber, address, zipCode, avatar } =
        newSeller?.seller;
      let seller = await ShopModel.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("Seller already exists", 400));
      }

      seller = await ShopModel.create({
        name,
        email,
        password,
        phoneNumber,
        address,
        zipCode,
        avatar,
        verified: true,
      });

      //   Generate a token to a seller
      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================||LOGIN SHOP ||============================

ShopRouter.post(
  "/login-shop",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email || !req.body.password) {
        return next(new ErrorHandler("Please provide the all fields", 400));
      }

      const seller = await ShopModel.findOne({ email }).select("+password");

      if (!seller) {
        return next(new ErrorHandler("User not found!", 400));
      }

      if (!seller.verified) {
        return next(
          new ErrorHandler(
            "Your account is not activate. Please check your email!",
            400
          )
        );
      }
      const isValidPassword = await comparePassword(
        req.body.password,
        seller?.password
      );
      if (!isValidPassword) {
        return next(new ErrorHandler("Invalid Credentials!", 400));
      }

      const { password, ...otherDetails } = seller?._doc;

      sendShopToken(otherDetails, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================|| GET SELLER BY SELLER TOKEN  ||============================

ShopRouter.get(
  "/getSeller",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const seller = await ShopModel.findById(req.seller.id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found!", 400));
      }
      res
        .status(200)
        .json({ success: true, seller: seller, message: "Seller found" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || LOGOUT SELLER ||=============================================
ShopRouter.get(
  "/logout",
  CatchAsyncError(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res
        .status(200)
        .json({ success: true, message: "Seller Logout successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================== || GET SHOP INFO ||=============================================
ShopRouter.get(
  "/get-shop-info/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const shop = await ShopModel.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ==================================|| UPDATE SHOP AVATAR ||====================================
ShopRouter.put(
  "/update-shop-avatar",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const id = req.seller.id ? req.seller.id : req.seller._id;
      const existSeller = await ShopModel.findById(id);
      const imageId = existSeller.avatar.public_id;
      if (existSeller?.avatar) {
        await cloudinary.v2.uploader.destroy(imageId);
      } else {
        const avatarLocalPath = req.body.avatar;
        if (!avatarLocalPath) {
          return next(new ErrorHandler("Avatar is required", 400));
        }

        const avatar = await uploadOnCloudinary(
          avatarLocalPath,
          ENUM.CLOUDINARY_AVATAR
        );

        existSeller.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

        await existSeller.save();

        res.status(200).json({
          success: true,
          message: "Seller Avatar Updated successfully",
          seller: existSeller,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ==================================|| UPDATE SHOP INFO ||====================================
ShopRouter.put(
  "/update-seller-info",
  isSellerAuthenticated,

  CatchAsyncError(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await ShopModel.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =============================== GET ALL SELLERS BY ADMIN ============================
ShopRouter.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const sellers = await ShopModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =============================== DELETE  SELLER BY ADMIN ============================
ShopRouter.delete(
  "/delete-seller-by-admin/:id",
  isAuthenticated,
  isAdmin("Admin"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const seller = await ShopModel.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }
      const imageId = seller.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// =============================== SHOP UPDATE WITHDRAW METHOD ============================
ShopRouter.put(
  "/update-payment-method",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await ShopModel.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =============================== SHOP DELETE WITHDRAW METHOD ============================
ShopRouter.delete(
  "/delete-withdraw-method",
  isSellerAuthenticated,
  CatchAsyncError(async (req, res, next) => {
    try {
      const seller = await ShopModel.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//

module.exports = ShopRouter;
