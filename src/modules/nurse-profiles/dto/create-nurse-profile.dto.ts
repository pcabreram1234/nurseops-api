import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsObject,
} from "class-validator";

import { EducationLevelTypes } from "@prisma/client";

export class CreateNurseProfileDto {
  @IsUUID()
  nurseId!: string;

  @IsDateString()
  birthDate!: string;

  @IsString()
  emergencyContactName!: string;

  @IsString()
  emergencyContactPhone!: string;

  @IsEnum(EducationLevelTypes)
  educationLevel!: EducationLevelTypes;

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
