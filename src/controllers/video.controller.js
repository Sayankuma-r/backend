import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


// ✅ Get All Videos (Search + Pagination + Sorting)
const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    page = parseInt(page)
    limit = parseInt(limit)

    const matchStage = {}

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    const sortOrder = sortType === "asc" ? 1 : -1

    const videos = await Video.aggregate([
        { $match: matchStage },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})



// ✅ Publish Video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const userId = req.user?._id

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoUpload || !thumbnailUpload) {
        throw new ApiError(500, "Error uploading to Cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner: userId,
        isPublished: true
    })

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    )
})



// ✅ Get Video By ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ])

    if (!video.length) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    )
})



// ✅ Update Video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    if (title) video.title = title
    if (description) video.description = description

    // thumbnail update
    if (req.file?.path) {
        const thumbnailUpload = await uploadOnCloudinary(req.file.path)
        video.thumbnail = thumbnailUpload.url
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    )
})



// ✅ Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    await Video.deleteOne({ _id: videoId })

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})



// ✅ Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled")
    )
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}