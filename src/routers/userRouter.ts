import express from "express";
import { AuthService } from "../services/AuthService";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { UserService } from "../services/UserService";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();
const authService = new AuthService();
const userService = new UserService();

router.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const result = await authService.createUser(user);
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

router.get("/employeesByOrganization/:organizationId",authMiddleware, async (req, res) => {
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
});

export default router;
