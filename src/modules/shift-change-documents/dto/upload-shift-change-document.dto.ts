import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

import { ShiftChangeDocumentTypeEnum } from "@modules/shift-change-documents/enums/shift-change-document-type.enum";

export class UploadShiftChangeDocumentDto {
  @IsUUID()
  shiftChangeRequestId!: string;

  @IsEnum(ShiftChangeDocumentTypeEnum)
  documentType!: ShiftChangeDocumentTypeEnum;

  @IsOptional()
  @IsString()
  description?: string;
}
