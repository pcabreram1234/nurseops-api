import {
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  ValidateIf,
} from "class-validator";

import { AbsenceType } from "@prisma/client";

export class CreateAbsenceDto {
  @IsString()
  nurseId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== "" && value !== null && value !== undefined)
  @IsDateString()
  endDate?: string;

  @IsString()
  reason!: string;

  @IsEnum(AbsenceType)
  type!: AbsenceType;

  @IsString()
  reporterById!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  requiresCoverage?: boolean;

  @IsOptional()
  @IsInt()
  emergencyLevel?: number;

  @IsOptional()
  @IsString()
  branchId?: string;
}