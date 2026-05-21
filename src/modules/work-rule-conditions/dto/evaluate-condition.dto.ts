import { IsObject, IsString } from "class-validator";

export class EvaluateConditionDto {
  @IsString()
  conditionId!: string;

  @IsObject()
  payload: any;
}
