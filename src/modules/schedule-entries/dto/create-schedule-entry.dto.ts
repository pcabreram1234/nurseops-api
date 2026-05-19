import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
} from "class-validator";

export class CreateScheduleEntryDto {
  @IsUUID()
  scheduleId!: string;

  @IsUUID()
  nurseId!: string;

  @IsUUID()
  shiftId!: string;

  @IsDateString()
  date!: string;

  @IsUUID()
  assignedById!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isEmergencyCoverage?: boolean;

  @IsOptional()
  @IsNumber()
  optimizationScore?: number;
}
