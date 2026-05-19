import { IsOptional, IsUUID, IsEnum, IsDateString } from "class-validator";

import { AbsenceStatus, AbsenceType } from "@prisma/client";

export class AbsenceFilterDto {
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsEnum(AbsenceType)
  type?: AbsenceType;

  @IsOptional()
  @IsEnum(AbsenceStatus)
  status?: AbsenceStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
