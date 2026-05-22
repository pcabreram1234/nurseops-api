import { IsString, IsNotEmpty, IsDate, IsObject } from 'class-validator';

export class CreateOptimizationRunDto {
    @IsString()
    @IsNotEmpty()
    scheduleId!: string;

    @IsDate()
    @IsNotEmpty()
    startedAtd!: Date;

    @IsDate()
    @IsNotEmpty()
    fineshedAt!: Date;

    @IsObject()
    @IsNotEmpty()
    result!: Record<string, any>;
}