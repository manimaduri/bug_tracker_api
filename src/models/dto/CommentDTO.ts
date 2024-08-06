import { IsUUID, IsString, MaxLength, IsOptional } from "class-validator";

export class CommentDTO {
  @IsUUID()
  bugId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @MaxLength(500)
  comment!: string;
}

export class UpdateCommentDTO {
  @IsString()
  @MaxLength(500)
  comment!: string;
}
