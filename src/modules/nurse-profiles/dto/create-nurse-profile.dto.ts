import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
} from "class-validator";

import { EducationLevelTypes } from "@prisma/client";

export class CreateNurseProfileDto {
  @IsString()
  organizationId!: string;

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
