import { IsOptional, IsUUID, IsEnum, IsDateString } from "class-validator";

import { NurseAvailabilityStatusType } from "@prisma/client";

export class NurseAvailabilityFilterDto {
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsEnum(NurseAvailabilityStatusType)
  status?: NurseAvailabilityStatusType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
