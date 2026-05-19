import { IsOptional, IsDateString, IsEnum, IsString } from "class-validator";

import { VacationStatus } from "@prisma/client";

export class UpdateVacationDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(VacationStatus)
  status?: VacationStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
