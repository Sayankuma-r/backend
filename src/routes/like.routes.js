import { Router } from "express"
import {
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/toggle/tweet/:tweetId")
    .post(verifyJWT, toggleTweetLike)

router.route("/toggle/video/:videoId")
    .post(verifyJWT, toggleVideoLike)

router.route("/videos")
    .get(verifyJWT, getLikedVideos)

export default router