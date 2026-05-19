import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  IsEnum,
} from "class-validator";

import { ShiftType } from "@prisma/client";

export class CreateShiftDto {
  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsEnum(ShiftType)
  type!: ShiftType;

  @IsDateString()
  startTime!: Date;

  @IsDateString()
  endTime!: Date;

  @IsInt()
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyShift?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSpecialization?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsOvertime?: boolean;

  @IsOptional()
  @IsInt()
  minimumStaffRequired?: number;
}
