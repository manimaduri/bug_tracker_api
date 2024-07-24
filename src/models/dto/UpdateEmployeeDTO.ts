import { IsString, IsOptional, IsDate, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateEmployeeDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'firstName must contain at least one letter' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'lastName must contain at least one letter' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'designation must contain at least one letter' })
  designation?: string;

  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;
}