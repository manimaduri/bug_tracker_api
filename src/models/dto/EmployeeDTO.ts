import { IsUUID, IsString, IsOptional, IsDate } from "class-validator";

export class EmployeeDTO {
  @IsUUID()
  userId!: string;

  @IsUUID()
  organizationId!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;
}
