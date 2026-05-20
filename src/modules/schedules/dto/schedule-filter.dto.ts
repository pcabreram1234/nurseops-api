import { IsOptional, IsUUID, IsInt, IsEnum } from "class-validator";

import { ScheduleStatus } from "@prisma/client";

export class ScheduleFilterDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsInt()
  month?: number;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
