import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
} from "class-validator";

import { ShiftType } from "@prisma/client";

export class ShiftFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
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
}
