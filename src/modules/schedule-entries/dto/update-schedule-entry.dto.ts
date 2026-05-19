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
}
