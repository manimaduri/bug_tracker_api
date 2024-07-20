import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const randomHex = randomBytes(16).toString("hex");

// Configure AWS S3 Client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

/**
 * Uploads a file or files to S3 and returns the URL or URLs.
 * @param file A file or an array of files to upload.
 */
export async function uploadToS3(
  file: Express.Multer.File | Express.Multer.File[]
) {
  if (Array.isArray(file)) {
    // Handle multiple files
    const uploadPromises = file.map((f) => uploadSingleFile(f));
    return Promise.all(uploadPromises);
  } else {
    // Handle a single file
    return [await uploadSingleFile(file)];
  }
}

/**
 * Uploads a single file to S3.
 * @param file The file to upload.
 */
async function uploadSingleFile(file: Express.Multer.File) {
  // Ensure the bucket name is defined
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not defined");
  }
  const fileKey = `${randomHex}_${file.originalname}`;
  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return fileKey;
}

/**
 * Generates a pre-signed URL for accessing a private file in S3.
 * @param fileKey The key of the file in the S3 bucket.
 * @param expires Duration in seconds for which the pre-signed URL is valid.
 */
export async function generatePresignedUrl(
  fileKey: string,
  expires: number = 300
) {
  // Use the S3Client instance directly instead of S3RequestPresigner
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
  });

  // Pass the S3Client instance directly to getSignedUrl
  return getSignedUrl(s3Client, command, { expiresIn: expires });
}
