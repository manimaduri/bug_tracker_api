import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { uploadSingleFile } from "../utils/uploadFiles"; // Import the function
import { HttpError } from "../utils/responseHandler";

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware to handle single file uploads to S3.
 */
export const uploadSingleMiddleware = upload.any();

export const s3UploadSingleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      if ((req.files as Express.Multer.File[]).length > 1) {
        return next(new HttpError("Only one file can be uploaded at a time.", 400));
      }
      const file = (req.files as Express.Multer.File[])[0];

      // Check if the file's MIME type is not an image
      if (!file.mimetype.startsWith("image/")) {
        return next(
          new HttpError(
            `Invalid file type: ${file.mimetype}. Only image files are allowed.`,
            400
          )
        );
      }

      // Check if the file exceeds the size limit of 2MB (2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        return next(
          new HttpError(
            `File size limit exceeded: ${file.originalname} is larger than 2MB.`,
            400
          )
        );
      }

      const key = await uploadSingleFile(file);
      req.body.imageKey = key; // Attach the URL to the request body
    }
    next();
  } catch (error) {
    next(error);
  }
};