//ProjectDTO.ts

import { Transform } from "class-transformer";
import {
  IsDate,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

// Custom decorator function
function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isFutureDate",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value instanceof Date) {
            return value > new Date(); // Check if the date is in the future
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date`;
        },
      },
    });
  };
}

export class ProjectDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: "Name must contain at least one letter" })
  projectName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  @Matches(/\S/, { message: "Description must contain at least one letter" })
  description!: string;

  //deadline is optional date

  @Transform(({ value }) => {
    // Attempt to convert string to Date if it matches the expected format
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    if (typeof value === 'string' && datePattern.test(value)) {
      const [day, month, year] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return value;
  })
  @IsDate()
  @IsFutureDate({ message: "Deadline must be a future date" })
  deadline?: Date;

  @IsString()
  status?: string;

  createdBy?: string;

}
