import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationalAlertStatus, PriorityTypes } from '@prisma/client';

export class OperationalAlertFilterDto {
    @IsOptional()
    @IsString()
    departmentId?: string;

    @IsOptional()
    @IsEnum(OperationalAlertStatus)
    status?: OperationalAlertStatus;

    @IsOptional()
    @IsEnum(PriorityTypes)
    severity?: PriorityTypes;

    /** Búsqueda por mensaje o tipo de alerta (server-side). */
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
