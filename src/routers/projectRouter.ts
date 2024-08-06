import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { ProjectService } from "../services/ProjectService";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { s3UploadSingleMiddleware, uploadSingleMiddleware } from "../middlewares/s3UploadSingleMiddleware";
const router = Router();

const projectService = new ProjectService();

router.post("/", authMiddleware,uploadSingleMiddleware,s3UploadSingleMiddleware, async (req, res) => {
  try {
    const project = await projectService.createProject(req);
    successResponse(res, project, 201);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to create project",
      error?.statusCode ?? 500
    );
  }
});

//all projects
router.get("/allProjects", authMiddleware, async (req, res) => {
  try {
    const projects = await projectService.getAllProjects(req);
    successResponse(res, projects, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to get projects",
      error?.statusCode ?? 500
    );
  }
});

//by id
router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req);
    successResponse(res, project, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to get project",
      error?.statusCode ?? 500
    );
  }
});




//get projects of an organization
router.get("/allProjects/:organizationId", authMiddleware, async (req, res) => {
  try {
    const projects = await projectService.getAllProjectsByOrganization(
      req.params.organizationId
    );
    successResponse(res, projects, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to get projects",
      error?.statusCode ?? 500
    );
  }
});

//update project
router.patch("/:projectId", authMiddleware, async (req, res) => {
  try {
    const project = await projectService.updateProject(req);
    successResponse(res, project, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to update project",
      error?.statusCode ?? 500
    );
  }
});

//updateProjectLogo
router.patch("/logo/:projectId", authMiddleware,uploadSingleMiddleware,s3UploadSingleMiddleware, async (req, res) => {
  try {
    const project = await projectService.updateProjectLogo(req);
    successResponse(res, project, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to update project logo",
      error?.statusCode ?? 500
    );
  }
});

export default router;
