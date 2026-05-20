import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateWorkRuleDto {
  @IsString()
  organizationId!: string;

  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
