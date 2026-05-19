import {
  IsUUID,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
} from "class-validator";

import { AbsenceType } from "@prisma/client";

export class CreateAbsenceDto {
  @IsUUID()
  nurseId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsString()
  reason!: string;

  @IsEnum(AbsenceType)
  type!: AbsenceType;

  @IsUUID()
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
}
