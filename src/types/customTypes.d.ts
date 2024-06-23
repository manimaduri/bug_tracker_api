import { Request } from 'express';

declare global {
  namespace Express {
    // Define the structure of the user object based on the JWT payload
    interface JwtPayload {
      userId: string;
      role: string;
    }

    // Extend the Request interface to include the user property
    interface Request {
      user?: JwtPayload;
    }
  }
}