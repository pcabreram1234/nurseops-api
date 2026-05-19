import { IsOptional, IsEnum, IsBoolean, IsString } from "class-validator";

import {
  NurseAvailabilityStatusType,
  ShiftPreferenceType,
} from "@prisma/client";

export class UpdateNurseAvailabilityDto {
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
}
