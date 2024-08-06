import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { CommentsService } from "../services/CommentsService";
const router = Router();

const commentsService = new CommentsService();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const comment = await commentsService.createComment(req);
    successResponse(res, comment, 201);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to create comment",
      error?.statusCode ?? 500
    );
  }
});

//updateComment
router.patch("/", authMiddleware, async (req, res) => {
  try {
    const comment = await commentsService.updateComment(req);
    successResponse(res, comment, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to update comment",
      error?.statusCode ?? 500
    );
  }
});

router.get("/allComments/:bugId", authMiddleware, async (req, res) => {
  try {
    const comments = await commentsService.getCommentsByBugId(req);
    successResponse(res, comments, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to fetch comments",
      error?.statusCode ?? 500
    );
  }
});

router.delete("/:commentId", authMiddleware, async (req, res) => {
  try {
    await commentsService.deleteComment(req);
    successResponse(res, "Comment deleted!", 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to delete comment",
      error?.statusCode ?? 500
    );
  }
});
export default router;