import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { UserProjectService } from "../services/UserProjectService";
import { errorResponse, successResponse } from "../utils/responseHandler";

const router = Router();

const userProjectService = new UserProjectService();

router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const users = await userProjectService.getUsersByProject(req.params.projectId);
    successResponse(res, users, 200);
  } catch (error: any) {
    errorResponse(res, error, error?.message ?? "Failed to get users by project ID", error?.statusCode ?? 500);
  }
});

export default router;