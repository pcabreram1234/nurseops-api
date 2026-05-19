import { IsOptional, IsUUID } from "class-validator";

export class OptimizationScoreFilterDto {
  @IsOptional()
  @IsUUID()
  nurseId?: string;
}
