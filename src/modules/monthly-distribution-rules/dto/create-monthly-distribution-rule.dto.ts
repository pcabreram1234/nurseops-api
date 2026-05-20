import { IsJSON, IsOptional, IsString } from "class-validator";

export class CreateMonthlyDistributionRuleDto {
  @IsString()
  organizationId!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  type!: string;

  @IsOptional()
  configuration?: any;
}
