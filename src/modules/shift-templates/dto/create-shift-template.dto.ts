import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

import { PreferredShift } from "@prisma/client";

export class CreateShiftTemplateDto {
  @IsString()
  organizationId!: string;

  @IsString()
  branchId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsEnum(PreferredShift)
  type!: PreferredShift;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  configuration?: any;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsInt()
  @Min(1)
  durationHours!: number;

  @IsBoolean()
  isNightShift!: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimum_staff?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAssignable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}