import { IsOptional, IsUUID, IsBoolean } from "class-validator";

export class EmergencyCandidateFilterDto {
  @IsOptional()
  @IsUUID()
  coverageRequestId?: string;

  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}
