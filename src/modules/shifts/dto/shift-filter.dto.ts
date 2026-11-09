import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,IsInt
} from "class-validator";

import { Type } from "class-transformer";

import { ShiftType } from "@prisma/client";

export class ShiftFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

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

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number = 1;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number = 10;
}
