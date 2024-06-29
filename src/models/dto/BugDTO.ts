import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Length,
  MaxLength,
} from "class-validator";

enum Classification {
  Bug = "Bug",
  Enhancement = "Enhancement",
  Feature = "Feature",
  Task = "Task",
  Question = "Question",
  Documentation = "Documentation",
  Security = "Security",
  Performance = "Performance",
  Test = "Test",
  Support = "Support",
}

enum Priority {
  High = "High",
  Low = "Low",
  Medium = "Medium",
}

enum Status {
  Open = "Open",
  Closed = "Closed",
  InProgress = "In Progress",
}

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

  @IsEnum(Classification, { message: "Invalid classification" })
  @IsOptional()
  classification?: Classification;

  @IsEnum(Priority, { message: "Invalid priority" })
  priority!: Priority;

  @IsEnum(Status, { message: "Invalid status" })
  status!: Status;
}
