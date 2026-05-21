import { IsObject, IsOptional } from "class-validator";

export class ExecuteWorkRuleActionDto {
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
