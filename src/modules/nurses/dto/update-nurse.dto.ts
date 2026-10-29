
import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional
} from "class-validator";

import { NurseStatusType, ContracTypeList } from "@prisma/client";

export class UpdateNurseDto {
  @IsString()
  userId!: string;

  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  specialityId!: string;

  @IsString()
  organizationId!: string;

  @IsString()
  contract_type!: ContracTypeList;

  @IsString()
  status!: NurseStatusType;

  @IsDateString()
  hire_date!: string;

  @IsBoolean()
  isCrossDepartmental!: boolean
}
