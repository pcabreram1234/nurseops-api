import { IsObject, IsString } from "class-validator";

export class EvaluateRuleDto {
  @IsString()
  ruleId!: string;

  @IsObject()
  payload: any;
}
