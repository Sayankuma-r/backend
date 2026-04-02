import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  avatar: {
    type: String,
    required: true,
  },

  coverImage: {
    type: String,
  },

  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  ],

  password: {
    type: String,
    required: [true, "Password is required"]
  },

  refreshToken: {
    type: String,
  },

}, {
  timestamps: true
});


// ✅ FIXED PASSWORD HASHING (NO next() BUG)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// ✅ PASSWORD CHECK
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// ✅ ACCESS TOKEN
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
    }
  );
};


// ✅ REFRESH TOKEN
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "10d",
    }
  );
};


userSchema.plugin(mongooseAggregatePaginate);

export const User = mongoose.model("User", userSchema);