import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateWorkRuleActionDto {
  @IsString()
  workRuleId!: string;

  @IsString()
  action_type!: string;

  @IsOptional()
  @IsString()
  action_value?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  stop_execution?: boolean;

  @IsOptional()
  @IsBoolean()
  async_execution?: boolean;
}
