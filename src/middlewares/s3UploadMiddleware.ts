import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { uploadToS3 } from "../utils/uploadFiles";

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware to handle file uploads to S3.
 */
export const uploadMiddleware = upload.any();

export const s3UploadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.files) {
      const keys = await uploadToS3(req.files as Express.Multer.File[]);
      req.body.imageKeys = keys; // Attach the URLs to the request body
    }
    next();
  } catch (error) {
    next(error);
  }
};
