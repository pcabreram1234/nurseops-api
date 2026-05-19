import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  IsInt,
  IsArray,
  IsObject,
} from "class-validator";

import { EducationLevelTypes } from "@prisma/client";

export class UpdateNurseProfileDto {
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsEnum(EducationLevelTypes)
  educationLevel?: EducationLevelTypes;

  @IsOptional()
  @IsObject()
  healthRestrictions?: any;

  @IsOptional()
  @IsInt()
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  certifications?: any[];

  @IsOptional()
  @IsArray()
  languages?: any[];

  @IsOptional()
  @IsString()
  notes?: string;
}
