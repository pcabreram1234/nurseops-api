import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
} from "class-validator";

import { ScheduleEntryStatus } from "@prisma/client";

export class UpdateScheduleEntryDto {
  @IsOptional()
  @IsEnum(ScheduleEntryStatus)
  status?: ScheduleEntryStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isEmergencyCoverage?: boolean;

  @IsOptional()
  @IsNumber()
  optimizationScore?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  shiftTemplateId?: string;
}