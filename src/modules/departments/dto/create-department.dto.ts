import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
} from "class-validator";

import { DepartmentType, DepartmentCriticalLevel } from "@prisma/client";

export class CreateDepartmentDto {
  @IsString()
  name!: string;

  @IsString()
  code?: string;

  @IsString()
  description?: string;

  @IsString()
  organizationId!: string;

  @IsString()
  branchId!: string;

  @IsEnum(DepartmentType)
  type!: DepartmentType;

  @IsEnum(DepartmentCriticalLevel)
  criticalLevel!: DepartmentCriticalLevel;

  @IsOptional()
  @IsInt()
  minimumStaff?: number;

  @IsOptional()
  @IsInt()
  optimalStaff?: number;

  @IsOptional()
  @IsInt()
  maxCapacity?: number;

  @IsOptional()
  @IsBoolean()
  allowOvertime?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsCrossDepartment?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSpecialization?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyDepartment?: boolean;

  @IsOptional()
  @IsInt()
  emergencyPriority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
