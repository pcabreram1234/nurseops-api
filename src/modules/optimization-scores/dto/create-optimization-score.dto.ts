import { IsUUID, IsNumber, IsOptional, IsObject } from "class-validator";

export class CreateOptimizationScoreDto {
  @IsUUID()
  nurseId!: string;

  @IsNumber()
  fairness_score!: number;

  @IsNumber()
  fatigue_score!: number;

  @IsNumber()
  workload_score!: number;

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
