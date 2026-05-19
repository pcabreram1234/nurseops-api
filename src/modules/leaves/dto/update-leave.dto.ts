import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsBoolean,
} from "class-validator";

import { LeaveStatus } from "@prisma/client";

export class UpdateLeaveDto {
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsUUID()
  approvedById?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsBoolean()
  emergencyCoverageRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  affectsSchedule?: boolean;
}
