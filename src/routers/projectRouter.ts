import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { ProjectService } from "../services/ProjectService";
import {
  errorResponse,
  successResponse,
} from "../utils/responseHandler";
const router = Router();

const projectService = new ProjectService();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const project = await projectService.createProject(req);
    successResponse(res, project, 201);
  } catch (error: any) {
    errorResponse(res, error, error?.message ?? "Failed to create project",error?.statusCode ?? 500);
  }
});

export default router;
