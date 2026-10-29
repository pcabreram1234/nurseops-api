import { IsOptional, IsEnum, IsBoolean, IsString, IsDateString } from "class-validator";

import {
  NurseAvailabilityStatusType,
  ShiftPreferenceType,
} from "@prisma/client";

export class UpdateNurseAvailabilityDto {
  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(NurseAvailabilityStatusType)
  status?: NurseAvailabilityStatusType;

  @IsOptional()
  @IsEnum(ShiftPreferenceType)
  shiftPreference?: ShiftPreferenceType;

  @IsOptional()
  @IsBoolean()
  availableForEmergency?: boolean;

  @IsOptional()
  @IsBoolean()
  availableForOvertime?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
