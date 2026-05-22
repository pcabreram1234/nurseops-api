import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class WorkloadScoreDto {
    @IsNotEmpty()
    @IsString()
    nurseId!: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    score!: number;
}