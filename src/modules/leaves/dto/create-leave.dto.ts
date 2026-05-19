import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

import { LeaveType } from "@prisma/client";

export class CreateLeaveDto {
  @IsUUID()
  userId!: string;

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
