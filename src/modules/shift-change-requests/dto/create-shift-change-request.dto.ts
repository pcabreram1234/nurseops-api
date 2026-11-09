import { IsBoolean, IsOptional, IsString } from "class-validator";
import { ShiftChangeOperationType } from "@prisma/client";

export class CreateShiftChangeRequestDto {
  @IsString()
  requesterId!: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsString()
  sourceScheduleEntryId!: string;

  @IsOptional()
  @IsString()
  targetScheduleEntryId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  emergencyRequest?: boolean;

  @IsOptional()
  @IsString()
  operationType!: ShiftChangeOperationType;
}
