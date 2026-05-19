import {
  IsUUID,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  IsString,
} from "class-validator";

import { PreferredShift } from "@prisma/client";

export class CreateNursePreferenceDto {
  @IsUUID()
  userId!: string;

  @IsEnum(PreferredShift)
  preferredShift!: PreferredShift;

  @IsOptional()
  @IsArray()
  @IsEnum(PreferredShift, {
    each: true,
  })
  avoidShifts?: PreferredShift[];

  @IsOptional()
  @IsInt()
  maxNightsPerMonth?: number;

  @IsOptional()
  @IsInt()
  maxDaysPerMonth?: number;

  @IsOptional()
  @IsArray()
  preferredDaysOff?: number[];

  @IsOptional()
  @IsBoolean()
  prefersWeekendsOff?: boolean;

  @IsOptional()
  @IsBoolean()
  allowOvertime?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
