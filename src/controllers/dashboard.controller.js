import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId =req.user?._id;

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "Invalid user ID")
    }   

    const totalVideos = await Video.countDocuments({owner: userId})

    const viewsResult = await Video.aggregate([


        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },{
            $group:{
                _id:null,
                totalViews:{$sum:"$views"}  
            }
        }


    ]);

    const totalViews =viewsResult[0]?.totalViews || 0;

    const totalSubscribers=await Subscription.countDocuments({
        chaneel:userId,
    });

    const likeResult =await Like.aggregate([

      {
        $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"videoData"
      }
    },{
        $unwind:"$videodata"
        
    },{
        $match:{
            "videoData.owner":new mongoose.Types.ObjectId(userId),
        }
    },{
        $count:"totalLikes"
    },
    ]);

    const totalLikes =likesResult[0]?.totalLikes || 0;

    return res.status(200)
    .json(new ApiResponse(
        200,{
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
         },
        "Channel stats fetched successfully"        
    )
);

    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }