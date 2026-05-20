import { IsOptional, IsString } from "class-validator";

export class MonthlyDistributionRuleFilterDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
