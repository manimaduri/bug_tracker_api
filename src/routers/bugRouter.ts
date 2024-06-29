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

export default router;
