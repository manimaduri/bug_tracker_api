// src/dtos/CreateOrganizationDTO.ts
import { IsString, IsUUID } from "class-validator";

export class CreateOrganizationDTO {
  @IsUUID()
  userId!: string;

  @IsString()
  companyName!: string;
}
