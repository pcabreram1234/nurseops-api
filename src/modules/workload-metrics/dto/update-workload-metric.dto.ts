import { IsOptional, IsNumber } from "class-validator";

export class UpdateWorkloadMetricDto {
  @IsOptional()
  @IsNumber()
  total_hours?: number;

  @IsOptional()
  @IsNumber()
  regular_hours?: number;

  @IsOptional()
  @IsNumber()
  night_hours?: number;

  @IsOptional()
  @IsNumber()
  weekend_hours?: number;

  @IsOptional()
  @IsNumber()
  holiday_hours?: number;

  @IsOptional()
  @IsNumber()
  overtime_hours?: number;

  @IsOptional()
  @IsNumber()
  emergency_hours?: number;

  @IsOptional()
  @IsNumber()
  fatigue_score?: number;

  @IsOptional()
  @IsNumber()
  fairness_score?: number;

  @IsOptional()
  @IsNumber()
  workload_score?: number;

  @IsOptional()
  @IsNumber()
  burnout_risk?: number;
}
