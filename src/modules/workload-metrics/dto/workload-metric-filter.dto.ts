import { IsOptional, IsUUID, IsInt } from "class-validator";

export class WorkloadMetricFilterDto {
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsInt()
  month?: number;

  @IsOptional()
  @IsInt()
  year?: number;
}
