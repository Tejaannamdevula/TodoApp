import { asyncHandler } from "../utils/asyncHandler.js";
import zod from "zod";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";

const registerSchema = zod.object({
  fullname: zod.string().min(1, "Full name is required"),
  email: zod.string().email("Invalid email address"),
  username: zod.string().min(3, "Username must be at least 3 characters long"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});

const generateAcessAndRefreshTokens = async function (userId) {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const acessToken = user.generateAcessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      acessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong when generating Acess and Referesh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    console.log("helelo");

    const validatedData = registerSchema.parse(req.body);
    const { fullname, email, username, password } = req.body;

    const userExist = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExist) {
      throw new ApiError(400, "User already exists");
    }
    const user = await User.create({
      fullname,
      email,
      username: username.toLowerCase(),
      password,
    });

    const createdUser = await User.findById(user_id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "User registered", createdUser));
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const ValidationError = new ApiError(
        400,
        "validation failed",
        error.errors
      );
      next(ValidationError);
    } else {
      next(error);
    }
  }
});

const loginUser = asyncHandler(async (req, res) => {
  /*
  
    req body->data
    username /email
    find the user 
    password check
    gen access and refresh token
  */
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({ $or: ["username", "email"] });

  if (!user) {
    throw new ApiError(400, "User doesnt exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAcessAndRefreshTokens(
    user._id
  );

  const LoggedUser = await User.findById(user._id).select(
    "-refreshToken, -password"
  );

  //can only modify cookies from server
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("acessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});
export { registerUser, loginUser, logOutUser };
