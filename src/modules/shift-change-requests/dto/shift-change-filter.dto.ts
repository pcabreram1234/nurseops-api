import { IsOptional, IsString, IsEnum, IsNumber } from "class-validator";
import { ShiftChangeOperationType } from "@prisma/client";

export class ShiftChangeFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  requesterId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsEnum(ShiftChangeOperationType)
  operationType?: ShiftChangeOperationType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
