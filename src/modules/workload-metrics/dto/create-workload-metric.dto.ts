import { IsString, IsNotEmpty, IsNumber, Min, Max, IsNumberString } from 'class-validator';

export class CreateWorkloadMetricDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  nurseId!: string;

  @IsNumberString()
  total_hours!: string;

  @IsNumberString()
  overtime_hours!: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  month!: number;

  @IsNumber()
  @Min(2020)
  year!: number;

  @IsNumberString()
  regular_hours!: string;

  @IsNumberString()
  nigth_hours!: string;

  @IsNumberString()
  weekend_hours!: string;

  @IsNumberString()
  holidy_hours!: string;

  @IsNumberString()
  emergency_hours!: string;

  @IsNumberString()
  fatigue_score!: string;

  @IsNumberString()
  fairness_score!: string;

  @IsNumberString()
  workload_score!: string;

  @IsNumberString()
  burnout_risk!: string;
}