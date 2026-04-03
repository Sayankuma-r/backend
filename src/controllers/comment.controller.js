import mongoose  from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiEroor.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments=asyncHandler(async(req,res)=>{//Get all comments of video id
    const {videoId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){//validate videoId
        throw new ApiError(400,"Invalid video id")
    }   

    const comments =await Comment.find({video:videoId})//fetch comment
    .populate("owner","username full avatar")
    .sort({createdAt :-1});


    return res.status(200)
    .json(new ApiResponse(true,"commments fetched successfully",comments))

})


const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {content}=req.body;

    if(!mongoose.Types.ObjectId.isValid(videoId)){//validate videoId
        throw new ApiError(400,"Invalid video id")
    }

    if(!content || content .trim()===""){
        throw new ApiError(400,"Comment content is required")
     
    }

    const comment =await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    const popularComments =await Comment.findById(comment._id)
    .populate("owner","username fullName avatar")
    
    
    return res.status(201)
    .json(new ApiResponse(201,popularComments,"Comment added successfully"))


})

const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const {content}=req.body;

    if(!mongoose.Types.ObjectId.isValid(commentId)){//validate commentId
        throw new ApiError(400,"Invalid comment id")
    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"Comment content is required")
    }

    const comment =await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Only the owner of the comment can update it")
    }

    comment.content=content;
    await comment.save();

    return res.status(200)
    .json(new ApiResponse(true,"Comment updated successfully",comment))

})

const deleteComment=asyncHandler(async(req,res)=>{  
    const {commentId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(commentId)){//validate commentId
        throw new ApiError(400,"Invalid comment id")
    }

    const comment =await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Only the owner of the comment can delete it")
    }

    await comment.deleteOne();

    return res.status(200)
    .json(new ApiResponse(true,"Comment deleted successfully",comment))

})


export {getVideoComments,addComment,updateComment,deleteComment}