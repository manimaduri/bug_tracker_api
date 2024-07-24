import { IsString , Matches, MaxLength, MinLength} from "class-validator";

export class UpdateOrganizationDTO {

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'Company name must contain at least one letter' })
  companyName!: string;
}
