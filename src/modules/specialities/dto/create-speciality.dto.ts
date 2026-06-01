import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateSpecialityDto {
  @IsString()
  organizationId!: string;

  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // 🌟 CAMBIO: Ahora acepta un arreglo de strings enviado desde el FrontEnd
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];
}