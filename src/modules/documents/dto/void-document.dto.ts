import { IsString, IsOptional } from "class-validator";

export class VoidDocumentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
