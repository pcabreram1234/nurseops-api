import { IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateOrganizationDto {
  @IsString({ message: "El nombre de la organización debe ser una cadena de texto." })
  @IsNotEmpty({ message: "El nombre de la organización es obligatorio." })
  name!: string;

  @IsString({ message: "El código de la organización debe ser una cadena de texto." })
  @IsNotEmpty({ message: "El código de la organización es obligatorio." })
  @Length(3, 20, { message: "El código debe tener entre 3 y 20 caracteres." })
  @Matches(/^[A-Z0-9-_]+$/, {
    message: "El código solo puede contener letras mayúsculas, números, guiones (-) y guiones bajos (_).",
  })
  code!: string;

  @IsString({ message: "El país debe ser una cadena de texto." })
  @IsNotEmpty({ message: "El país es obligatorio." })
  country!: string;

  @IsString({ message: "La zona horaria debe ser una cadena de texto." })
  @IsOptional()
  timezone?: string; // Opcional, ya que en el servicio le asignamos por defecto 'America/Santo_Domingo' si no viene

  @IsString({ message: "El estado debe ser una cadena de texto." })
  @IsOptional()
  @Length(1, 1, { message: "El estado debe ser un único carácter (Ej: 'A' para Activo)." })
  status?: string; // Opcional, el servicio le asignará 'A' por defecto
}