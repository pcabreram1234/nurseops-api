import { IsNumber, Min, Max } from 'class-validator';

export class OptimizationScoreDto {
    @IsNumber()
    @Min(0)
    @Max(100)
    score!: number;
}