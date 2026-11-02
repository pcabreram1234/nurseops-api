import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  IsArray,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export enum DocumentTemplateFormatDto {
  PDF = "PDF",
  DOCX = "DOCX",
}

export class CreateDocumentTemplateDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Tipo de documento: VACATION_RECEIPT, ABSENCE_CERTIFICATE, SCHEDULE_REPORT, ...
  @IsString()
  documentType!: string;

  @IsOptional()
  @IsEnum(DocumentTemplateFormatDto)
  format?: DocumentTemplateFormatDto;

  @IsOptional()
  @IsObject()
  header?: Record<string, any>;

  // Cuerpo de la plantilla con campos dinámicos {{campo}}
  @IsString()
  body!: string;

  @IsOptional()
  @IsObject()
  footer?: Record<string, any>;

  @IsOptional()
  @IsString()
  logoPath?: string;

  @IsOptional()
  @IsObject()
  fields?: Record<string, any>;

  @IsOptional()
  @IsString()
  numberingPrefix?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberingDigits?: number;

  @IsOptional()
  @IsArray()
  signatureBlocks?: any[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  effectiveFromMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  retentionDays?: number;

  // Sede opcional (si no se indica, aplica a toda la organización)
  @IsOptional()
  @IsString()
  branchId?: string;
}
