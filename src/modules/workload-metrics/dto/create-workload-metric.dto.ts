import { IsUUID, IsNumber, IsInt, IsOptional } from "class-validator";

export class CreateWorkloadMetricDto {
  @IsUUID()
  nurseId!: string;

  @IsInt()
  month!: number;

  @IsInt()
  year!: number;

  @IsNumber()
  total_hours!: number;

  @IsNumber()
  regular_hours!: number;

  @IsNumber()
  night_hours!: number;

  @IsNumber()
  weekend_hours!: number;

  @IsNumber()
  holiday_hours!: number;

  @IsNumber()
  overtime_hours!: number;

  @IsNumber()
  emergency_hours!: number;

  @IsNumber()
  fatigue_score!: number;

  @IsNumber()
  fairness_score!: number;

  @IsOptional()
  @IsNumber()
  workload_score?: number;

  @IsOptional()
  @IsNumber()
  burnout_risk?: number;
}
