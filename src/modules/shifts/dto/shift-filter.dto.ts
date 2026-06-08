import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
} from "class-validator";

import { ShiftType } from "@prisma/client";

export class ShiftFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(ShiftType)
  type?: ShiftType;

  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyShift?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  startTime!: string

  @IsOptional()
  @IsString()
  endTime!: string
}
