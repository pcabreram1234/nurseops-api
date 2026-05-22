import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkloadSummaryDto {
    @IsNotEmpty()
    @IsString()
    organizationId!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number;

    @Type(() => Number)
    @IsInt()
    @Min(2024)
    year!: number;
}