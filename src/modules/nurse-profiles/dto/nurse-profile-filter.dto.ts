import { IsOptional, IsUUID, IsEnum } from "class-validator";

import { EducationLevelTypes } from "@prisma/client";

export class NurseProfileFilterDto {
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsEnum(EducationLevelTypes)
  educationLevel?: EducationLevelTypes;
}
