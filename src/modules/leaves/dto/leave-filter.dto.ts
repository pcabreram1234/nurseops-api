import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";

import { LeaveStatus, LeaveType } from "@prisma/client";

export class LeaveFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
