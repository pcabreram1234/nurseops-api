import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

import { VacationStatus } from "@prisma/client";

export class VacationFilterDto {
  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(VacationStatus)
  status?: VacationStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 25;
}
