import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

import { PriorityTypes } from "@prisma/client";

export class CreateEmergencyCoverageDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  shiftId!: string;

  @IsString()
  nurseId!: string;

  @IsDateString()
  date!: Date;

  @IsEnum(PriorityTypes)
  priority!: PriorityTypes;
}
