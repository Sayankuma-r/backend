import { Router } from "express"
import {
    createPlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/")
    .post(verifyJWT, createPlaylist)

router.route("/user/:userId")
    .get(getUserPlaylists)

router.route("/:playlistId/add/:videoId")
    .patch(verifyJWT, addVideoToPlaylist)

router.route("/:playlistId/remove/:videoId")
    .patch(verifyJWT, removeVideoFromPlaylist)

router.route("/:playlistId")
    .delete(verifyJWT, deletePlaylist)

export default router