const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
    unique: true,
    lowecase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: Number,
  },
  addresses: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      addressType: {
        type: String,
      },
      state: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    default: "User",
    enum: ["User", "Admin"],
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
    default: Date.now(),
  },
  verified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
  isAzure: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
  },
});

// Hash password before saving
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Generate JWT token
function generateJwtToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

// Compare password
async function comparePassword(enteredPassword, hashedPassword) {
  return await bcrypt.compare(enteredPassword, hashedPassword);
}

const userModel = mongoose.model("User", userSchema);

module.exports = {
  hashPassword,
  generateJwtToken,
  comparePassword,
  userModel,
};

// userSchema.pre("save", async function (next) {
//   if(!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 10)
//   next()
// })

// userSchema.methods.isPasswordCorrect = async function(password){
//   return await bcrypt.compare(password, this.password)
// }

// userSchema.methods.generateAccessToken = function(){
//   return jwt.sign(
//       {
//           _id: this._id,
//           email: this.email,
//           username: this.username,
//           fullName: this.fullName
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       {
//           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//       }
//   )
// }
// userSchema.methods.generateRefreshToken = function(){
//   return jwt.sign(
//       {
//           _id: this._id,

//       },
//       process.env.REFRESH_TOKEN_SECRET,
//       {
//           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//       }
//   )
// }
