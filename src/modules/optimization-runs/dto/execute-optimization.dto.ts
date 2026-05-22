import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { OptimizationStrategy } from '../enums/optimization-strategy.enum';

export class ExecuteOptimizationDto {
    @IsString()
    @IsNotEmpty()
    scheduleId!: string;

    @IsEnum(OptimizationStrategy)
    strategy!: OptimizationStrategy;

    @IsInt()
    @Min(10)
    @Max(1000)
    maxIterations: number = 100;

    @IsBoolean()
    allowOvertime: boolean = false;
}