import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
} from "class-validator";

import {
  NurseAvailabilityStatusType,
  ShiftPreferenceType,
} from "@prisma/client";

export class CreateNurseAvailabilityDto {
  @IsString()
  nurseId!: string;

  @IsDateString()
  date!: string;

  @IsEnum(NurseAvailabilityStatusType)
  status!: NurseAvailabilityStatusType;

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
