import { IsObject, IsString } from "class-validator";

export class EvaluateDistributionDto {
  @IsString()
  ruleId!: string;

  @IsObject()
  payload: any;
}
