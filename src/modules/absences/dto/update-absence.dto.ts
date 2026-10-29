import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  IsUUID,
  ValidateIf,
} from "class-validator";

import { AbsenceStatus, AbsenceType } from "@prisma/client";

export class UpdateAbsenceDto {
  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== "" && value !== null && value !== undefined)
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AbsenceType)
  type?: AbsenceType;

  @IsOptional()
  @IsString()
  reporterById?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(AbsenceStatus)
  status?: AbsenceStatus;

  @IsOptional()
  @IsUUID()
  approvedById?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  requiresCoverage?: boolean;

  @IsOptional()
  @IsInt()
  emergencyLevel?: number;
}
