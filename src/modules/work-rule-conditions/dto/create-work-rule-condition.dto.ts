import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateWorkRuleConditionDto {
  @IsString()
  workRuleId!: string;

  @IsString()
  condition_type!: string;

  @IsString()
  operator!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  logical_group?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
