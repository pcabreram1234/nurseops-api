import { IsBoolean, IsOptional, IsString } from "class-validator";

export class VerifyShiftChangeDocumentDto {
  @IsBoolean()
  verified!: boolean;

  @IsOptional()
  @IsString()
  comments?: string;
}
