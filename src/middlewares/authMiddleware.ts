import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { errorResponse } from "../utils/responseHandler";
import { NextFunction, Request, Response } from "express";

dotenv.config();

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get the Authorization header
  const authHeader = req.header("Authorization");

  // Check if not Authorization header
  if (!authHeader) {
    return errorResponse(res, null, "Please login, authorization denied", 401);
  }

  // Check if Authorization header is in the format "Bearer <token>"
  if (!authHeader.startsWith("Bearer ")) {
    return errorResponse(
      res,
      authHeader,
      "Invalid Authorization header format, authorization denied",
      401
    );
  }

  // Extract the token from the Authorization header
  const token = authHeader.substring(7); // Skip the "Bearer " part

  // Verify token
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);

    req.user = user as Express.JwtPayload;
    next();
  } catch (err) {
    next(err);
  }
}
