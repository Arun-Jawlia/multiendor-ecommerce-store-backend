const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");

const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const sendVerficationEmail = require("../utils/SendVerificationEmail");
const sendShopToken = require("../utils/SendShopToken");
const uploadOnCloudinary = require("../utils/Cloudinary");

const { ShopModel } = require("../models/shop.model");
const { hashPassword, comparePassword } = require("../models/user.model");
const ENUM = require("../config/ENUM");

// ================= UTILS =================
const createActivationToken = (seller) =>
  jwt.sign({ seller }, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });

// ================= CONTROLLERS =================
exports.createShop = CatchAsyncError(async (req, res, next) => {
  const { name, email, password, phoneNumber, address, zipCode } = req.body;

  if (await ShopModel.findOne({ email })) {
    return next(new ErrorHandler("Seller already exists", 400));
  }

  const avatarPath = req?.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    return next(new ErrorHandler("Avatar is required", 400));
  }

  const avatar = await uploadOnCloudinary(
    avatarPath,
    ENUM.CLOUDINARY_AVATAR
  );

  const seller = {
    name,
    email,
    password: await hashPassword(password),
    phoneNumber,
    address,
    zipCode,
    avatar: {
      public_id: avatar.public_id,
      url: avatar.secure_url,
    },
  };

  const activationToken = createActivationToken(seller);
  const activationURL = `http://localhost:3000/shop/activation/${activationToken}`;

  await sendVerficationEmail({
    email,
    subject: "Activate your seller account",
    message: `Hello ${name}, activate your account: ${activationURL}`,
  });

  res.status(201).json({
    success: true,
    message: `Check your email ${email} to activate your seller account`,
  });
});

exports.activateShop = CatchAsyncError(async (req, res, next) => {
  const { activation_token } = req.body;

  const decoded = jwt.verify(
    activation_token,
    process.env.ACTIVATION_SECRET
  );

  if (await ShopModel.findOne({ email: decoded.seller.email })) {
    return next(new ErrorHandler("Seller already exists", 400));
  }

  const seller = await ShopModel.create({
    ...decoded.seller,
    verified: true,
  });

  sendShopToken(seller, 201, res);
});

exports.loginShop = CatchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const seller = await ShopModel.findOne({ email }).select("+password");
  if (!seller) return next(new ErrorHandler("Seller not found", 404));
  if (!seller.verified)
    return next(new ErrorHandler("Account not activated", 400));

  if (!(await comparePassword(password, seller.password))) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  sendShopToken(seller, 200, res);
});

exports.getSeller = CatchAsyncError(async (req, res, next) => {
  const seller = await ShopModel.findById(req.seller.id);
  if (!seller) return next(new ErrorHandler("Seller not found", 404));

  res.status(200).json({ success: true, seller });
});

exports.logoutSeller = CatchAsyncError(async (req, res) => {
  res.cookie("seller_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.status(200).json({ success: true, message: "Logged out" });
});

exports.getShopInfo = CatchAsyncError(async (req, res, next) => {
  const shop = await ShopModel.findById(req.params.id);
  if (!shop) return next(new ErrorHandler("Shop not found", 404));

  res.status(200).json({ success: true, shop });
});

exports.updateShopAvatar = CatchAsyncError(async (req, res, next) => {
  const seller = await ShopModel.findById(req.seller.id);

  const avatarPath = req?.files?.avatar?.[0]?.path;
  if (!avatarPath)
    return next(new ErrorHandler("Avatar required", 400));

  if (seller.avatar?.public_id) {
    await cloudinary.v2.uploader.destroy(
      seller.avatar.public_id
    );
  }

  const avatar = await uploadOnCloudinary(
    avatarPath,
    ENUM.CLOUDINARY_AVATAR
  );

  seller.avatar = {
    public_id: avatar.public_id,
    url: avatar.secure_url,
  };

  await seller.save();

  res.status(200).json({ success: true, seller });
});

exports.updateSellerInfo = CatchAsyncError(async (req, res, next) => {
  const seller = await ShopModel.findById(req.seller.id);
  if (!seller) return next(new ErrorHandler("Seller not found", 404));

  Object.assign(seller, req.body);
  await seller.save();

  res.status(200).json({ success: true, seller });
});

exports.adminGetAllSellers = CatchAsyncError(async (req, res) => {
  const sellers = await ShopModel.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, sellers });
});

exports.adminDeleteSeller = CatchAsyncError(async (req, res, next) => {
  const seller = await ShopModel.findById(req.params.id);
  if (!seller) return next(new ErrorHandler("Seller not found", 404));

  if (seller.avatar?.public_id) {
    await cloudinary.v2.uploader.destroy(
      seller.avatar.public_id
    );
  }

  await seller.deleteOne();

  res.status(200).json({
    success: true,
    message: "Seller deleted successfully",
  });
});

exports.updateWithdrawMethod = CatchAsyncError(async (req, res) => {
  const seller = await ShopModel.findByIdAndUpdate(
    req.seller.id,
    { withdrawMethod: req.body.withdrawMethod },
    { new: true }
  );

  res.status(200).json({ success: true, seller });
});

exports.deleteWithdrawMethod = CatchAsyncError(async (req, res, next) => {
  const seller = await ShopModel.findById(req.seller.id);
  if (!seller) return next(new ErrorHandler("Seller not found", 404));

  seller.withdrawMethod = null;
  await seller.save();

  res.status(200).json({ success: true, seller });
});
