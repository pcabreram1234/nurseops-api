import { IsOptional, IsString } from 'class-validator';

export class OptimizationFilterDto {
    @IsOptional()
    @IsString()
    scheduleId?: string;
}