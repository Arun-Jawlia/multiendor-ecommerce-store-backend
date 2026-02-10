const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const generator = require("generate-password");

const {
  userModel,
  hashPassword,
  comparePassword,
} = require("../models/user.model");

const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const sendToken = require("../utils/SendToken");
const sendVerficationEmail = require("../utils/SendVerificationEmail");
const uploadOnCloudinary = require("../utils/Cloudinary");
const ENUM = require("../config/ENUM");

// ================= UTILS =================
const createActivationToken = (user) =>
  jwt.sign({ user }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });

// ================= CONTROLLERS =================
exports.createUser = CatchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((f) => !f?.trim())) {
    return next(new ErrorHandler("All Fields Required", 400));
  }

  if (await userModel.findOne({ email })) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const avatarPath = req?.files?.avatar?.[0]?.path;
  if (!avatarPath) return next(new ErrorHandler("Avatar is required", 400));

  const avatar = await uploadOnCloudinary(
    avatarPath,
    ENUM.CLOUDINARY_AVATAR
  );

  const user = {
    name,
    email,
    password: await hashPassword(password),
    avatar: {
      public_id: avatar.public_id,
      url: avatar.secure_url,
    },
  };

  const activationToken = createActivationToken(user);
  const activationURL = `http://localhost:3000/activation/${activationToken}`;

  await sendVerficationEmail({
    email,
    subject: "Activate your account",
    message: `Hello ${name}, click to activate: ${activationURL}`,
  });

  res.status(201).json({
    success: true,
    message: `Please check your email ${email}`,
  });
});

exports.activateUser = CatchAsyncError(async (req, res, next) => {
  const { activation_token } = req.body;

  const decoded = jwt.verify(
    activation_token,
    process.env.ACTIVATION_SECRET
  );

  if (await userModel.findOne({ email: decoded.user.email })) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const user = await userModel.create({
    ...decoded.user,
    verified: true,
  });

  sendToken(user, 201, res);
});

exports.azureAuthentication = CatchAsyncError(async (req, res) => {
  const { name, email } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return sendToken(user, 200, res);

  const password = await hashPassword(
    generator.generate({ length: 20, numbers: true })
  );

  user = await userModel.create({
    name,
    email,
    password,
    isAzure: true,
    verified: true,
  });

  sendToken(user, 201, res);
});

exports.loginUser = CatchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User not found", 400));
  if (user.isAzure)
    return next(new ErrorHandler("Login with Azure", 400));
  if (!user.verified)
    return next(new ErrorHandler("Account not activated", 400));

  if (!(await comparePassword(password, user.password))) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  sendToken(user, 200, res);
});

exports.getUser = CatchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({ success: true, user });
});

exports.logoutUser = CatchAsyncError(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.status(200).json({ success: true, message: "Logged out" });
});

exports.updateUserInfo = CatchAsyncError(async (req, res, next) => {
  if (req.body.userId !== req.user.id) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  const user = await userModel.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true }
  );

  res.status(200).json({ success: true, user });
});

exports.updateUserAvatar = CatchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  if (!req?.files?.avatar) {
    return next(new ErrorHandler("Avatar required", 400));
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  const avatar = await uploadOnCloudinary(
    req.files.avatar[0].path,
    ENUM.CLOUDINARY_AVATAR
  );

  user.avatar = {
    public_id: avatar.public_id,
    url: avatar.secure_url,
  };

  await user.save();

  res.status(200).json({ success: true, user });
});

exports.updateUserAddress = CatchAsyncError(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  user.addresses.push(req.body);
  await user.save();
  res.status(200).json({ success: true, user });
});

exports.deleteUserAddress = CatchAsyncError(async (req, res) => {
  await userModel.updateOne(
    { _id: req.user.id },
    { $pull: { addresses: { _id: req.params.id } } }
  );
  res.status(200).json({ success: true });
});

exports.changeUserPassword = CatchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user.id).select("+password");

  if (
    !(await comparePassword(req.body.oldPassword, user.password))
  ) {
    return next(new ErrorHandler("Old password incorrect", 400));
  }

  user.password = await hashPassword(req.body.newPassword);
  await user.save();

  res.status(200).json({ success: true });
});

exports.getUserById = CatchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({ success: true, user });
});

exports.adminGetAllUsers = CatchAsyncError(async (req, res) => {
  const users = await userModel.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, users });
});

exports.adminDeleteUser = CatchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.deleteOne();

  res.status(200).json({ success: true });
});
