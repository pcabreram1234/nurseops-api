import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsDateString,
  IsArray,
} from "class-validator";

import { NurseStatusType } from "@prisma/client";

export class UpdateNurseDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsEnum(NurseStatusType)
  status?: NurseStatusType;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  seniorityLevel?: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @IsOptional()
  @IsInt()
  maxWeeklyHours?: number;

  @IsOptional()
  @IsArray()
  preferredShifts?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
