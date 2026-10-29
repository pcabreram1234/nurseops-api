import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class OptimizationFilterDto {
    @IsOptional()
    @IsString()
    scheduleId?: string;

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
