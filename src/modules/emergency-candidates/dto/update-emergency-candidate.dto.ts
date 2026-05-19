import { IsOptional, IsNumber, IsBoolean } from "class-validator";

export class UpdateEmergencyCandidateDto {
  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  rank?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}
