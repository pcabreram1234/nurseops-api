import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsUUID,
} from "class-validator";

import { AbsenceStatus } from "@prisma/client";

export class UpdateAbsenceDto {
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
  notes?: string;

  @IsOptional()
  @IsBoolean()
  requiresCoverage?: boolean;

  @IsOptional()
  @IsInt()
  emergencyLevel?: number;
}
