import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  console.log(fullName, email, username);

  // 🔹 Validation
  if (
    [fullName, email, username, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 🔹 Check if user exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("Found user:", existedUser);

  if (existedUser) {
    throw new ApiError(400, "User with email or username already exists");
  }

  // 🔹 Get file paths safely
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  // 🔹 Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // 🔹 Create user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  // 🔹 Remove sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  // 🔹 Response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});
const generateAccessAndRefrshTokens =async(userId)=>{
    try{
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken=refreshToken;
      await user.save({validateBeforeSave:false});
      return {accessToken, refreshToken};

    }
    catch(error){

    }
  }
const LoginUser =asyncHandler(async (req,res)=>{
   const { email , username,password }=req.body;

   if(!username && !email){
    throw new ApiError(400,"username or email is required")
   }

   const user = await User.findOne({
    $or:[{username},{email}]
   })

   if(!user){
    throw new ApiError(404,"User not found")
   }


  const isPasswordValid = await User.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefrshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options={
    httponly:true,
    secure:true
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,
    {
      user:loggedInUser,accessToken,
      refreshToken  
    },
    "user logged in successfully"
    )) 

    })


    const LogoutUser = asyncHandler(async(req,res)=>{
      await User.findByIdAndUpdate(
        req.user._id,{
          $set:{
            refreshToken:undefined
            }
        },
        {
          new:true
        }

      )
      const options={
        httponly:true,
        secure:true
      }
      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new ApiResponse(200,{},"User logged out successfully"))

    })


export {
   registerUser,
  LoginUser ,
  LogoutUser
}