import { IsOptional, IsBoolean, IsEnum, IsString } from "class-validator";

import {
  NurseRestrictionTypes,
  NurseRestrictionDescriptions,
  PriorityTypes,
} from "@prisma/client";

export class UpdateRestrictionTypeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(NurseRestrictionTypes)
  name?: NurseRestrictionTypes;

  @IsOptional()
  @IsEnum(NurseRestrictionDescriptions)
  description?: NurseRestrictionDescriptions;

  @IsOptional()
  @IsEnum(PriorityTypes)
  severity?: PriorityTypes;

  @IsOptional()
  @IsBoolean()
  affects_scheduler?: boolean;

  @IsOptional()
  @IsBoolean()
  affects_overtime?: boolean;

  @IsOptional()
  @IsBoolean()
  affects_nights?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
