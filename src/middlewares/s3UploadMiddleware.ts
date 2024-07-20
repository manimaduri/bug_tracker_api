import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { uploadToS3 } from "../utils/uploadFiles";
import { HttpError } from "../utils/responseHandler";

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
      const filesArray = req.files as Express.Multer.File[];

      // Check if any file's MIME type is not an image
      const nonImageFile = filesArray.find(
        (file) => !file.mimetype.startsWith("image/")
      );
      if (nonImageFile) {
        // If a non-image file is found, throw an error or pass an error to next()
        return next(
          new HttpError(
            `Invalid file type: ${nonImageFile.mimetype}. Only image files are allowed.`,
            400
          )
        );
      }
      const keys = await uploadToS3(req.files as Express.Multer.File[]);
      req.body.imageKeys = keys; // Attach the URLs to the request body
    }
    next();
  } catch (error) {
    next(error);
  }
};
