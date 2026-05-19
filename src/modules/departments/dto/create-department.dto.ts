import {
  IsString,
  IsUUID,
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

  @IsUUID()
  organizationId!: string;

  @IsUUID()
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
  allowsOvertime?: boolean;

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
}
