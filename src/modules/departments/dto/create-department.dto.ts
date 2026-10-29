import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsArray,
  ArrayMinSize,
} from "class-validator";

import { DepartmentType, DepartmentCriticalLevel } from "@prisma/client";

export class CreateDepartmentDto {
  @IsString()
  name!: string;

  @IsString()
  code?: string;

  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  /**
   * Sedes en las que opera el departamento (N:M).
   * `branchIds` es la forma nueva; `branchId` se mantiene por compatibilidad.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  branchIds?: string[];

  @IsOptional()
  @IsString()
  branchId?: string;

  /** Sede principal del departamento. Debe pertenecer a `branchIds`. */
  @IsOptional()
  @IsString()
  primaryBranchId?: string;

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
