import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";

import { VacationStatus } from "@prisma/client";

export class CreateVacationDto {
  @IsString()
  nurseId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsEnum(VacationStatus)
  status?: VacationStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
