import { IsString, IsOptional, IsObject } from "class-validator";

export class GenerateDocumentDto {
  @IsString()
  templateId!: string;

  // Empleado/enfermera relacionado (opcional según tipo de documento)
  @IsOptional()
  @IsString()
  employeeId?: string;

  // Solicitud de vacaciones relacionada (para comprobantes de vacaciones)
  @IsOptional()
  @IsString()
  vacationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  // Título del documento generado (si no se indica, se toma de la plantilla)
  @IsOptional()
  @IsString()
  title?: string;

  // Valores dinámicos adicionales para los campos {{campo}} de la plantilla
  @IsOptional()
  @IsObject()
  values?: Record<string, any>;
}
