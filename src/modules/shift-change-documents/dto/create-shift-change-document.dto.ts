import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

import { ShiftChangeDocumentTypeEnum } from "@modules/shift-change-documents/enums/shift-change-document-type.enum";

export class CreateShiftChangeDocumentDto {
  @IsUUID()
  shiftChangeRequestId!: string;

  @IsUUID()
  requesterId!: string;

  @IsEnum(ShiftChangeDocumentTypeEnum)
  documentType!: ShiftChangeDocumentTypeEnum;

  @IsString()
  documentUrl!: string;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
