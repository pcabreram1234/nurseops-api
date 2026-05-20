import { IsObject, IsString } from "class-validator";

export class EvaluateRuleGroupDto {
  @IsString()
  ruleGroupId!: string;

  @IsObject()
  payload: any;
}
