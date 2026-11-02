import {
  IsInt,
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
  IsObject,
  IsDateString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ContracTypeList } from "@prisma/client";

export class CreateVacationPolicyRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsInt()
  seniorityFromMonths!: number;

  @IsOptional()
  @IsInt()
  seniorityToMonths?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  daysGranted!: number;

  // ANNUAL_GRANT, MONTHLY_ACCRUAL, PER_WORKED_HOUR
  @IsString()
  accrualMethod!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ContracTypeList, { each: true })
  contractTypes?: ContracTypeList[];

  @IsOptional()
  @IsString()
  employeeCategoryCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWeeklyHours?: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;
}
