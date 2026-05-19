import { IsEnum, IsOptional, IsString } from "class-validator";

import { VacationStatus } from "@prisma/client";

export class ApproveVacationDto {
  @IsEnum(VacationStatus)
  status!: VacationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
