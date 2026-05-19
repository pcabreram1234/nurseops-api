import { IsOptional, IsString, IsEnum, IsInt } from "class-validator";

import { Type } from "class-transformer";

import { NurseStatusType ,ContracTypeList} from "@prisma/client";

export class NurseFilterDto {
  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  @IsOptional()
  @IsString()
  search?: string;

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  @IsOptional()
  @IsEnum(NurseStatusType)
  status?: NurseStatusType;

  /*
  |--------------------------------------------------------------------------
  | DEPARTMENT
  |--------------------------------------------------------------------------
  */

  @IsOptional()
  @IsString()
  departmentId?: string;

  /*
  |--------------------------------------------------------------------------
  | CONTRACT TYPE
  |--------------------------------------------------------------------------
  */

  @IsOptional()
  @IsEnum(ContracTypeList)
  contractType?: ContracTypeList;
  

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}
