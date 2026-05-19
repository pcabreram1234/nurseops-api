import { IsOptional, IsNumber, IsObject } from "class-validator";

export class UpdateOptimizationScoreDto {
  @IsOptional()
  @IsNumber()
  fairness_score?: number;

  @IsOptional()
  @IsNumber()
  fatigue_score?: number;

  @IsOptional()
  @IsNumber()
  workload_score?: number;

  @IsOptional()
  @IsNumber()
  overtime_score?: number;

  @IsOptional()
  @IsNumber()
  preference_score?: number;

  @IsOptional()
  @IsNumber()
  overall_score?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
