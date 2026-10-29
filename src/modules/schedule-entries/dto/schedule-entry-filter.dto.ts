import { IsOptional, IsDateString, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class ScheduleEntryFilterDto {
  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @IsString()
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

  @IsOptional()
  @IsString()
  branchId?: string;

  /** Búsqueda server-side por notas, enfermera o nombre del turno. */
  @IsOptional()
  @IsString()
  search?: string;

  /** Estado de la asignación (server-side). */
  @IsOptional()
  @IsString()
  status?: string;

  /** Paginación opcional. Sin page/limit la respuesta es un array plano. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
