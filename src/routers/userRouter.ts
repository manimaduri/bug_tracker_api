import express from "express";
import { UserService } from "../services/UserService";
import { errorResponse, successResponse } from "../utils/responseHandler";

const router = express.Router();
const userService = new UserService();

router.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const result = await userService.createUser(user);
    successResponse(res, result, 201);
  } catch (error: any) {
    console.error("Error creating user........:", error.stack);
    errorResponse(res, error, error?.message ?? "Registration Failed! Please try again.",error?.statusCode || 500);
  }
});

export default router;
