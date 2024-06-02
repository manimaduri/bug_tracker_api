import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export enum UserRole {
  ORGANIZATION = "organization",
  EMPLOYEE = "employee",
}

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @MinLength(1)
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: "Mobile number should be exactly 10 digits." })
  @MaxLength(10, { message: "Mobile number should be exactly 10 digits." })
  @Matches(/^\d+$/, { message: "mobileNumber must only contain digits." })
  mobileNumber?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        "password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }
  )
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, {
    message: "profilePicture must contain at least one letter.",
  })
  profilePicture?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: "city must contain at least one letter." })
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: "state must contain at least one letter." })
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: "country must contain at least one letter." })
  country?: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;
}
