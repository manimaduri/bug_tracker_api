import { Response } from 'express';

export function successResponse(res: Response, data: any, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function errorResponse(res: Response, error: any, message: string, statusCode: number = 400) {
  console.error("errorResponse.....", error.stack);
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}