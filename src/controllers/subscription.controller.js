import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// ✅ Toggle Subscription (Subscribe / Unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id   // logged-in user

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    if (channelId === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    // check if already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if (existingSubscription) {
        // 🔴 Unsubscribe
        await Subscription.deleteOne({ _id: existingSubscription._id })

        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        )
    }

    // 🟢 Subscribe
    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId
    })

    return res.status(201).json(
        new ApiResponse(201, newSubscription, "Subscribed successfully")
    )
})



// ✅ Get all subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                avatar: "$subscriberDetails.avatar"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})



// ✅ Get all channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: 0,
                channelId: "$channelDetails._id",
                username: "$channelDetails.username",
                avatar: "$channelDetails.avatar"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    )
})



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}