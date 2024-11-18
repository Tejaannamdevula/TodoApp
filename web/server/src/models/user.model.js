import mongoose, { Schema } from "mongoose";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//pre hook before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

//comparing passowords

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAcessToken = async function () {
  //short lived acess token
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACESS_TOKEN_SECRET,
    { expiresIn: process.env.ACESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  //Refresh token lives long
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};
export const User = mongoose.model("User", userSchema);
