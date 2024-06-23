import { validate } from "class-validator";
import { HttpError } from "./responseHandler";

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