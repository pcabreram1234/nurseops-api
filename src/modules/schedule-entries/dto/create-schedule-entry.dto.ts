import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
} from "class-validator";

export class CreateScheduleEntryDto {
  @IsString()
  scheduleId!: string;

  @IsString()
  nurseId!: string;

  @IsString()
  shiftId!: string;

  @IsString()
  shiftTemplateId!: string;

  /**
   * Opcional: se deriva del horario (Schedule) y la base de datos lo valida.
   */
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  assignedById?: string;

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