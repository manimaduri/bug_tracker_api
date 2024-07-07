import { Router } from "express";
import { BugService } from "../services/BugService";
import { errorResponse, successResponse } from "../utils/responseHandler";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const bugService = new BugService();

router.post("/",authMiddleware, async (req, res) => {
  try {
    const bug = await bugService.createBug(req);
    successResponse(res, bug, 201);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to create bug",
      error?.statusCode ?? 500
    );
  }
});

router.get("/getBugsByProject/:projectId",authMiddleware, async (req, res) => {
  try {
    const bugs = await bugService.findBugsByProjectId(req);
    successResponse(res, bugs);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to find bugs",
      error?.statusCode ?? 500
    );
  }
});

//get bugs of all projects even that other users are assigned to and created but it should be same projects the user is in use UserProject model to find projects and get all bugs in the project
router.get("/allBugs",authMiddleware, async (req, res) => {
  try {
    const bugs = await bugService.findAllBugs(req);
    successResponse(res, bugs);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to find bugs",
      error?.statusCode ?? 500
    );
  }
});



router.get("/:bugId",authMiddleware, async (req, res) => {
  try {
    const bug = await bugService.findBugById(req);
    successResponse(res, bug);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to find bug",
      error?.statusCode ?? 500
    );
  }
});

router.post("/findBugsAssignedToUsers",authMiddleware, async (req, res) => {
  try {
    const userIds = req.body.userIds;
    const bugs = await bugService.findBugsAssignedToUsers(userIds);
    successResponse(res, bugs);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to find bugs assigned to users",
      error?.statusCode ?? 500
    );
  }
});

router.post("/findBugsCreatedByUsers",authMiddleware, async (req, res) => {
  try {
    const userIds = req.body.userIds;
    const bugs = await bugService.findBugsCreatedByUsers(userIds);
    successResponse(res, bugs);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to find bugs created by users",
      error?.statusCode ?? 500
    );
  }
});

export default router;
