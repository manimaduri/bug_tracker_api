import { validate } from "class-validator";

class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function validateDTO(dto: any) {
  const errors = await validate(dto);
  if (errors.length > 0) {
    const errorMessages = errors
      .filter(error => error.constraints)
      .map(error => {
        const constraints = Object.values(error.constraints!);
        return constraints[1] || constraints[0];
      })
      .join(", ");
      throw new HttpError(errorMessages, 400);
  }
}