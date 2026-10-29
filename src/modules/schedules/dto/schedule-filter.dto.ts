import { IsOptional, IsString, IsInt, IsEnum } from "class-validator";
import { Type } from "class-transformer";

import { ScheduleStatus } from "@prisma/client";

export class ScheduleFilterDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
