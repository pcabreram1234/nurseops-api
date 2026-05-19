import { IsOptional, IsUUID, IsEnum, IsDateString } from "class-validator";

import { VacationStatus } from "@prisma/client";

export class VacationFilterDto {
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsEnum(VacationStatus)
  status?: VacationStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
