import { IsBoolean, IsOptional, IsString } from "class-validator";

export class WorkRuleFilterDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  code?: string;
}
