import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkloadMetricFilterDto {
  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  year?: number;

  /** Búsqueda server-side por nombre de enfermera. */
  @IsOptional()
  @IsString()
  search?: string;

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
