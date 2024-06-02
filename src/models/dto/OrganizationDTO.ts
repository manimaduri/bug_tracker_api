// src/dtos/CreateOrganizationDTO.ts
import { IsString, IsUUID , Matches, MaxLength, MinLength} from "class-validator";

export class CreateOrganizationDTO {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'Company name must contain at least one letter' })
  companyName!: string;
}
