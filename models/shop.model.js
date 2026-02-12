const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your shop name"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your shop email!"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password should be greater than 6 characters"],
      select: false,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    address: {
      country: String,
      state: String,
      city: String,
      address1: String,
      zipCode: Number,
    },
    role: {
      type: String,
      default: "Seller",
      enum: ["Seller"],
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    withdrawMethod: {
      type: mongoose.Schema.Types.Mixed,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          default: "Processing",
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        updatedAt: {
          type: Date,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordTime: Date,
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

shopSchema.index({ email: 1 }, { unique: true });

const ShopModel = mongoose.model("Shop", shopSchema);

module.exports = {
  ShopModel,
};
