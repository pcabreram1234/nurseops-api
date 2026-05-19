import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
} from "class-validator";

import { DepartmentType, DepartmentCriticalLevel } from "@prisma/client";

export class DepartmentFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
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
}
