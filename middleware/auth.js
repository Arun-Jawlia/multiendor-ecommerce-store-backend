const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("./CatchAsyncError");
const { userModel } = require("../models/user.model");
const { ShopModel } = require("../models/shop.model");

// ========================|| Check User is authenticated || ==================================
exports.isAuthenticated = CatchAsyncError(async (req, res, next) => {
  const { token } = req?.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to continue or Not Authorized", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await userModel.findById(decoded?.id);

  next();
});

// ========================|| Check Seller is authenticated || ==================================
exports.isSellerAuthenticated = CatchAsyncError(async (req, res, next) => {
  const { seller_token } = req?.cookies;
  
  if (!seller_token) {
    return next(new ErrorHandler("Please Login to continue or Not Authorized", 401));
  }
  
  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
  
  req.seller = await ShopModel.findById(decoded?.id);
  
  next();
});

// ========================|| Check User is ADMIN || ==================================
exports.isAdmin = (...roles) => {
  return (req,res,next) => {
      if(!roles.includes(req.user.role)){
          return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
      };
      next();
  }
}