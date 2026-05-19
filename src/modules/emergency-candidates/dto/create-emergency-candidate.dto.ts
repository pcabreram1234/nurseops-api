import { IsUUID, IsNumber, IsOptional, IsBoolean } from "class-validator";

export class CreateEmergencyCandidateDto {
  @IsUUID()
  coverageRequestId!: string;

  @IsUUID()
  nurseId!: string;

  @IsNumber()
  score!: number;

  @IsOptional()
  @IsNumber()
  rank?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
