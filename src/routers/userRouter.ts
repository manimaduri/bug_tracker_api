import express from "express";
import { AuthService } from "../services/AuthService";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { UserService } from "../services/UserService";
import authMiddleware from "../middlewares/authMiddleware";
import {
  s3UploadSingleMiddleware,
  uploadSingleMiddleware,
} from "../middlewares/s3UploadSingleMiddleware";

const router = express.Router();
const authService = new AuthService();
const userService = new UserService();

router.post("/register", async (req, res) => {
  try {
    const result = await authService.createUser(req);
    successResponse(res, result, 201);
  } catch (error: any) {
    console.error("Error creating user........:", error.stack);
    errorResponse(
      res,
      error,
      error?.message ?? "Registration Failed! Please try again.",
      error?.statusCode || 500
    );
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticateUser(email, password);
    successResponse(res, result, 200);
  } catch (error: any) {
    console.error("Error logging in user........:", error.stack);
    errorResponse(
      res,
      error,
      error?.message ?? "Login Failed! Please try again.",
      error?.statusCode || 500
    );
  }
});

router.post("/externalEmployee", authMiddleware, async (req, res) => {
  try {
    await authService.createExternalEmployeeUser(req);
    successResponse(res, "Employee created!", 201);
  } catch (error: any) {
    console.error("Error creating external employee user........:", error.stack);
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to create external employee user",
      error?.statusCode || 500
    );
  }
});

router.get(
  "/employeesByOrganization/:organizationId",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await userService.getAllEmployeesByOrganization(
        req.params.organizationId
      );
      successResponse(res, result, 200);
    } catch (error: any) {
      console.error("Error fetching employees........:", error.stack);
      errorResponse(
        res,
        error,
        error?.message ?? "Failed to fetch employees.",
        error?.statusCode || 500
      );
    }
  }
);

router.patch("/updateUser", authMiddleware, async (req, res) => {
  try {
    const result = await userService.updateUser(req);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to update user.",
      error?.statusCode || 500
    );
  }
});

router.patch(
  "/updateProfilePicture",
  authMiddleware,
  uploadSingleMiddleware,
  s3UploadSingleMiddleware,
  async (req, res) => {
    try {
      const result = await userService.updateProfilePicture(req);
      successResponse(res, result, 200);
    } catch (error: any) {
      errorResponse(
        res,
        error,
        error?.message ?? "Failed to update profile picture",
        error?.statusCode || 500
      );
    }
  }
);

router.delete("/deleteProfilePicture", authMiddleware, async (req, res) => {
  try {
    const result = await userService.deleteProfilePicture(req);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to delete profile picture",
      error?.statusCode || 500
    );
  }
});

router.patch("/toggleUserRole/:userId", authMiddleware, async (req, res) => {
  try {
    const result = await userService.toggleUserRole(req);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to toggle user role",
      error?.statusCode || 500
    );
  }
});

router.patch("/changePassword", authMiddleware, async (req, res) => {
  try {
    const result = await userService.changePassword(req);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(
      res,
      error,
      error?.message ?? "Failed to change password",
      error?.statusCode || 500
    );
  }
});

export default router;
