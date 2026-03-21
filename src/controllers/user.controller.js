import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"

import { User } from "../models/User.model.js";

import{ uploadOnCloudinary } from "../utils/cloudinary.js"; 
import{ ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
   // get user details from frontend
   //validation -not empty
    //check if user already exists
    //check for images,check for avavtar

    //upload them to cloudinary,avatar

    //create user object -create entry in database
    //remove password and refresh token from response
    //check for user creation
    //return res


    const { fullName, email, username, password } = req.body;
 console.log(fullName, email, username, password);

   if(
    [fullName, email, username, password].some((field) =>field?.trim() === "" )
   ){
    throw new ApiError("All fields are required",400)
   }


  const existedUser = User.findOne({
    $or:[{ username },{ email   }]
   })

   if(existedUser) {
    throw new ApiError(400,"User with email or username already exists")
   }    

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
   }

   if(!coverImageLocalPath){
    throw new ApiError(400,"Cover image is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
    throw new ApiError(400,"Failed to upload avatar")
   }
   
 


  const user = await User.create(
    {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url?.url || "",
        email,
        username: username.toLowerCase(),
        password
    }
   )

   const createdUser = await User.findById(user._id).select("-password -refreshToken").select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Failed to create user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
   )

});

export { registerUser };