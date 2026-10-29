import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsBoolean,
} from "class-validator";

import { LeaveType } from "@prisma/client";

export class CreateLeaveDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsEnum(LeaveType)
  type!: LeaveType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  emergencyCoverageRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  affectsSchedule?: boolean;
}
