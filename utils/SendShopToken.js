const { generateJwtToken } = require("../models/user.model");

// Create token and save the token in cookie
const sendShopToken = async (seller, statusCode, res) => {
  const token = generateJwtToken(seller?._id);

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };
  res.status(statusCode).cookie("seller_token", token, options).json({
    success: true,
    seller,
    token,
  });
};

module.exports = sendShopToken;
