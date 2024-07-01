import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Length,
  MaxLength,
} from "class-validator";
import { BugClassification, BugPriority, BugStatus } from "../Bug";



export class BugDTO {
  @IsUUID()
  @IsNotEmpty()
  projectId!: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsUUID()
  @IsNotEmpty()
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  bugName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  description!: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(BugClassification, { message: "Invalid classification" })
  @IsOptional()
  classification?: BugClassification;

  @IsEnum(BugPriority, { message: "Invalid priority" })
  priority!: BugPriority;

  @IsEnum(BugStatus, { message: "Invalid status" })
  status!: BugStatus;
}
