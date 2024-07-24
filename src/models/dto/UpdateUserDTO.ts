import {
    IsString,
    IsOptional,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
  } from "class-validator";
  
  export class UpdateUserDTO {
    @IsOptional()
    @IsEmail()
    @MinLength(1)
    @MaxLength(255)
    email?: string;
  
    @IsOptional()
    @IsString()
    @MinLength(10, { message: "Mobile number should be exactly 10 digits." })
    @MaxLength(10, { message: "Mobile number should be exactly 10 digits." })
    @Matches(/^\d+$/, { message: "Mobile number must only contain digits." })
    mobileNumber?: string;
  
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
  }