import { IsOptional, IsUUID, IsDateString, IsString } from "class-validator";

export class ScheduleEntryFilterDto {
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

}
