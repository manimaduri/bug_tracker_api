import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
} from "class-validator";

export enum UserRole {
  ORGANIZATION = "organization",
  EMPLOYEE = "employee",
}

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;
}
