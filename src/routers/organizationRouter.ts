import { Router } from "express";
import { successResponse, errorResponse } from "../utils/responseHandler";
import authMiddleware from "../middlewares/authMiddleware";
import { OrganizationService } from "../services/OrganizationService";
const router = Router();

const organizationService = new OrganizationService();

router.patch("/updateOrganization", authMiddleware, async (req, res) => {
  try {
    const updatedOrganization = await organizationService.updateOrganization(
      req
    );
    successResponse(res, updatedOrganization);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to update organization",
      error?.statusCode ?? 500
    );
  }
});

export default router;
