import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateRuleGroupDto {
  @IsString()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
