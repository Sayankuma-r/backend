import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ✅ Toggle Tweet Like
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked"));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet liked"));
});


// ✅ Toggle Video Like
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked"));
  }

  await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video liked"));
});


// ✅ Get All Liked Videos of User
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true }
  }).populate("video");

  return res.status(200).json(
    new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
  );
});


export {
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos   // ✅ FIXED EXPORT
};