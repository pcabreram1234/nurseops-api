import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateSpecialityDto {
  @IsString()
  organizationId!: string;

  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
