import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

import { DepartmentType, DepartmentCriticalLevel } from "@prisma/client";

export class DepartmentFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(DepartmentType)
  type?: DepartmentType;

  @IsOptional()
  @IsEnum(DepartmentCriticalLevel)
  criticalLevel?: DepartmentCriticalLevel;

  @IsOptional()
  @IsBoolean()
  isEmergencyDepartment?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 25;
}
