import { IsInt, IsOptional, IsString } from "class-validator";

export class AssignRuleDto {
  @IsString()
  workRuleId!: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
