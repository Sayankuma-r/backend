import { Router } from "express"
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/:videoId")
    .post(verifyJWT, addComment)
    .get(getVideoComments)

router.route("/c/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment)

export default router;   // ✅ FIXED