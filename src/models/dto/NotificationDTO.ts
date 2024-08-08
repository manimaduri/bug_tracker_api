import { IsUUID, IsString, IsBoolean, IsNotEmpty } from "class-validator";

export class NotificationDTO {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  referenceId!: string;
}

export class UpdateNotificationDTO {
  @IsUUID()
  id!: string;

  @IsBoolean()
  read!: boolean;
}
