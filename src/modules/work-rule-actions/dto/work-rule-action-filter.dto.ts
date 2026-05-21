import { IsOptional, IsString } from "class-validator";

export class WorkRuleActionFilterDto {
  @IsOptional()
  @IsString()
  workRuleId?: string;

  @IsOptional()
  @IsString()
  action_type?: string;
}
